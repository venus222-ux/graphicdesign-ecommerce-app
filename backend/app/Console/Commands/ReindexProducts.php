<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use App\Services\ProductSearchService;

class ReindexProducts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'products:reindex';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reindex all products in Elasticsearch';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Starting products reindex...");

        $service = app(ProductSearchService::class);

        // Chunk products to avoid memory issues
        $bar = $this->output->createProgressBar(Product::count());
        $bar->start();

        Product::chunk(100, function ($products) use ($service, $bar) {
          $service->bulkIndex($products);
          $bar->advance(count($products));
        });

        $bar->finish();
        $this->info("\nAll products reindexed successfully!");
    }
}
