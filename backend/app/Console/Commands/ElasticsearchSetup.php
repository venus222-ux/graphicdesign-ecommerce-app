<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Elastic\Elasticsearch\ClientBuilder;

class ElasticsearchSetup extends Command
{
    protected $signature = 'elasticsearch:setup';
    protected $description = 'Create Elasticsearch index with mapping';

    public function handle()
    {
        $client = ClientBuilder::create()
            ->setHosts([config('services.elasticsearch.host')])
            ->build();

        $index = config('services.elasticsearch.index');

        // ❌ delete if exists (IMPORTANT for updates)
        if ($client->indices()->exists(['index' => $index])->asBool()) {
            $this->warn("Deleting existing index...");
            $client->indices()->delete(['index' => $index]);
        }

        // ✅ create fresh index
        $client->indices()->create([
            'index' => $index,
            'body' => [
                'settings' => [
                    'analysis' => [
                        'analyzer' => [
                            'custom_analyzer' => [
                                'type' => 'standard',
                                'stopwords' => '_english_'
                            ]
                        ]
                    ]
                ],
                'mappings' => [
                    'properties' => [
                        'title' => [
                            'type' => 'text',
                            'analyzer' => 'custom_analyzer',
                            'fields' => [
                                'keyword' => ['type' => 'keyword']
                            ]
                        ],
                        'description' => [
                            'type' => 'text',
                            'analyzer' => 'custom_analyzer'
                        ],
                        'price' => ['type' => 'float'],
                        'category_id' => ['type' => 'integer'],
                        'category_name' => ['type' => 'keyword'],
                        'asset_type' => ['type' => 'keyword'],
                        'created_at' => ['type' => 'date'],
                    ]
                ]
            ]
        ]);

        $this->info("✅ Elasticsearch index created!");

        return Command::SUCCESS;
    }
}


/**
 * | Component              | Responsabilitate        |
| ---------------------- | ----------------------- |
| `ElasticsearchSetup`   | creează index + mapping |
| `ReindexProducts`      | bagă date               |
| `ProductSearchService` | face search             |

 */
