<?php
namespace App\Services;

use Elastic\Elasticsearch\ClientBuilder;
use App\Models\Product;
use Illuminate\Support\Facades\Log;

class ProductSearchService
{
    protected $client;

public function __construct()
{
    $this->client = \Elastic\Elasticsearch\ClientBuilder::create()
        ->setHosts([config('services.elasticsearch.host')])
        ->build();
}

public function index(Product $product)
{
try {
        return $this->client->index([
            'index' => config('services.elasticsearch.index'),
            'id'    => $product->id,
            'body'  => [
                'title'             => $product->title,
                'id' => $product->id,
                'slug'              => $product->slug,
                'description'       => $product->description,
                'short_description' => $product->short_description ?? null,
                'price' => (float) $product->price,
                'final_price' => (float) $product->final_price, // Index the calculated price
                'on_sale' => (bool) $product->hasActiveDiscount(),
                'category_id'       => $product->category_id,
                'category_name'     => $product->category?->name,
                'asset_type'        => $product->asset_type,
                'created_at'        => $product->created_at,

                // 👇 ADD THESE TWO LINES 👇
                'preview_url'       => $product->preview_url,
                'preview_urls'      => $product->preview_urls,
            ],
        ]);
    } catch (\Exception $e) {
        Log::error('Elasticsearch index failed', [
            'product_id' => $product->id,
            'error' => $e->getMessage(),
        ]);
    }
}

public function search($query, $filters = [], $from = 0, $size = 12, $sort = 'newest')
{
    $must = [];
    $filter = [];

    // 🔍 FUZZY SEARCH
    if ($query) {
        $must[] = [
            'multi_match' => [
                'query' => $query,
                'fields' => ['title^3', 'description'],
                'fuzziness' => 'AUTO',
                'operator' => 'and'
            ]
        ];
    }

    // 🎯 FILTERS
    if (!empty($filters['category'])) {
        $filter[] = [
            'term' => ['category_id' => $filters['category']]
        ];
    }

    if (!empty($filters['asset_type'])) {
        $filter[] = [
            'term' => ['asset_type' => $filters['asset_type']]
        ];
    }

    if (!empty($filters['min_price']) || !empty($filters['max_price'])) {
        $range = [];

        if (!empty($filters['min_price'])) {
            $range['gte'] = $filters['min_price'];
        }

        if (!empty($filters['max_price'])) {
            $range['lte'] = $filters['max_price'];
        }

        $filter[] = [
            'range' => [
                'price' => $range
            ]
        ];
    }

    // ⭐ SORT OPTIONS
    $sortOptions = [
        'newest'    => ['created_at' => ['order' => 'desc']],
        'price_asc' => ['price' => ['order' => 'asc']],
        'price_desc'=> ['price' => ['order' => 'desc']],
        '_score'    => '_score',
    ];

    // If searching, prioritize relevance then apply selected sort
    $sortClause = $query
        ? [
            $sortOptions['_score'],
            $sortOptions[$sort] ?? $sortOptions['newest']
        ]
        : [
            $sortOptions[$sort] ?? $sortOptions['newest']
        ];

    return $this->client->search([
        'index' => config('services.elasticsearch.index'),
        'body' => [
            'from' => $from,
            'size' => $size,

            'query' => [
                'bool' => [
                    'must' => $must,
                    'filter' => $filter
                ]
            ],

            // ⭐ DYNAMIC SORT
            'sort' => $sortClause,

            // 📊 AGGREGATIONS
            'aggs' => [
                'categories' => [
                    'terms' => [
                        'field' => 'category_id',
                        'size' => 10
                    ]
                ]
            ]
        ]
    ]);
}

public function delete(int $id): void
{
    try {
        $this->client->delete([
            'index' => config('services.elasticsearch.index'),
            'id'    => $id,
        ]);
    } catch (\Throwable $e) {
        Log::warning('ES delete failed', [
            'id' => $id,
            'error' => $e->getMessage()
        ]);
    }
}

  public function bulkIndex($products)
{
    $params = ['body' => []];

    foreach ($products as $product) {
        $params['body'][] = [
            'index' => [
                '_index' => config('services.elasticsearch.index'),
                '_id' => $product->id,
            ]
        ];

        $params['body'][] = [
            'title'             => $product->title,
            'id' => $product->id,
            'slug'              => $product->slug,
            'description'       => $product->description,
             'price' => (float) $product->price,
            'final_price' => (float) $product->final_price, // Index the calculated price
            'on_sale' => (bool) $product->hasActiveDiscount(),
            'category_id'       => $product->category_id,
            'asset_type'        => $product->asset_type,

            // 👇 ADD THESE TWO LINES HERE AS WELL 👇
            'preview_url'       => $product->preview_url,
            'preview_urls'      => $product->preview_urls,
        ];
    }

    return $this->client->bulk($params);
}

}


/***
 *
👉 Rol: Logica principală Elasticsearch (core-ul sistemului)

Responsabilități:

Indexare produse
Căutare full-text
Aplicare filtre (categorie, preț etc.)
Sortare (price asc/desc, newest)
Construirea query-urilor Elasticsearch
 */
