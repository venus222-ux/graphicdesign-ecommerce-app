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
                'title'          => $product->title,
                'slug'           => $product->slug,
                'description'    => $product->description,
                'short_description' => $product->short_description ?? null,
                'price'          => $product->price,
                'category_id'    => $product->category_id,
                'category_name'  => $product->category?->name,
                'asset_type'     => $product->asset_type,
                'created_at'     => $product->created_at,
            ],
        ]);
    } catch (\Exception $e) {
        Log::error('Elasticsearch index failed', [
            'product_id' => $product->id,
            'error' => $e->getMessage(),
        ]);
    }
}

public function search($query, $filters = [], $from = 0, $size = 12)
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
        $filter[] = ['term' => ['category_id' => $filters['category']]];
    }

    if (!empty($filters['asset_type'])) {
        $filter[] = ['term' => ['asset_type' => $filters['asset_type']]];
    }

    if (!empty($filters['min_price']) || !empty($filters['max_price'])) {
        $range = [];
        if (!empty($filters['min_price'])) $range['gte'] = $filters['min_price'];
        if (!empty($filters['max_price'])) $range['lte'] = $filters['max_price'];

        $filter[] = ['range' => ['price' => $range]];
    }

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

            // ⭐ SORT
            'sort' => [
                '_score',
                ['created_at' => 'desc']
            ],

            // 📊 AGGREGATIONS (categories sidebar)
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
            'title' => $product->title,
            'slug'  => $product->slug,
            'description' => $product->description,
            'price' => $product->price,
            'category_id' => $product->category_id,
            'asset_type' => $product->asset_type,
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
