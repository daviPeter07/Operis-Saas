<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Testing\TestResponse;

function makeListingCompany(string $document): Company
{
    return Company::query()->create([
        'name' => 'Empresa '.$document,
        'document_type' => 'cnpj',
        'document' => $document,
        'address' => 'Rua Vendas',
        'phone' => '92999999999',
        'email' => $document.'@test.com',
        'city' => 'Manaus',
        'state' => 'AM',
        'verified_at' => now(),
    ]);
}

/**
 * @param  list<array{0: Product, 1: float|int, 2: float|int}>  $items  [product, quantity, unit price]
 */
function makeListingSale(Company $company, array $attributes, array $items): Sale
{
    $subtotal = collect($items)->sum(fn (array $item): float => $item[1] * $item[2]);
    $discount = $attributes['discount'] ?? 0;

    $sale = Sale::query()->create([
        'company_id' => $company->id,
        'status' => 'completed',
        'payment_method' => 'cash',
        'installments' => 1,
        'subtotal' => $subtotal,
        'total' => $subtotal - $discount,
        ...$attributes,
    ]);

    foreach ($items as [$product, $quantity, $unitPrice]) {
        $sale->items()->create([
            'company_id' => $company->id,
            'product_id' => $product->id,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'unit_cost' => $product->cost,
            'subtotal' => $quantity * $unitPrice,
        ]);
    }

    return $sale;
}

function listSales(array $query = []): TestResponse
{
    return test()->actingAs(test()->user)->getJson('/api/sales?'.http_build_query($query));
}

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->company = makeListingCompany('61000000000001');
    CompanyUser::query()->create([
        'company_id' => $this->company->id,
        'user_id' => $this->user->id,
        'role' => 'owner',
        'status' => 'active',
    ]);
    $this->user->update(['current_company_id' => $this->company->id]);

    $companyId = $this->company->id;
    $this->logitech = Brand::query()->create(['company_id' => $companyId, 'name' => 'Logitech', 'status' => 'active']);
    $this->samsung = Brand::query()->create(['company_id' => $companyId, 'name' => 'Samsung', 'status' => 'active']);
    $this->peripherals = Category::query()->create(['company_id' => $companyId, 'name' => 'Periféricos', 'status' => 'active']);
    $this->monitors = Category::query()->create(['company_id' => $companyId, 'name' => 'Monitores', 'status' => 'active']);

    $product = fn (string $name, Brand $brand, Category $category, float $cost): Product => Product::query()->create([
        'company_id' => $companyId,
        'category_id' => $category->id,
        'brand_id' => $brand->id,
        'name' => $name,
        'sku' => strtoupper(substr($name, 0, 3)),
        'sale_price' => $cost * 2,
        'cost' => $cost,
        'stock' => 100,
        'status' => 'active',
    ]);
    $mouse = $product('Mouse sem fio', $this->logitech, $this->peripherals, 20);
    $keyboard = $product('Teclado mecânico', $this->logitech, $this->peripherals, 50);
    $monitor = $product('Monitor 24', $this->samsung, $this->monitors, 500);

    $ana = Customer::query()->create(['company_id' => $companyId, 'name' => 'Ana Souza', 'status' => 'active']);
    $bruno = Customer::query()->create(['company_id' => $companyId, 'name' => 'Bruno Lima', 'status' => 'active']);

    // Created in this order, one hour apart. Totals and profits are in different orders on purpose.
    $this->travelTo(Carbon::parse('2026-11-01 10:00:00'));
    // total 100, profit 2 x (50 - 20) = 60
    $this->cashSale = makeListingSale($this->company, ['customer_id' => $ana->id, 'date' => '2026-11-01'], [[$mouse, 2, 50]]);
    $this->travel(1)->hours();
    // total 55, profit (150 - 50) - 95 = 5
    $this->pixSale = makeListingSale($this->company, ['customer_id' => $bruno->id, 'date' => '2026-11-03', 'payment_method' => 'pix', 'status' => 'pending', 'discount' => 95], [[$keyboard, 1, 150]]);
    $this->travel(1)->hours();
    // total 850, profit (800 - 500) + (50 - 20) = 330
    $this->cardSale = makeListingSale($this->company, ['date' => '2026-11-10', 'payment_method' => 'card_credit', 'status' => 'cancelled', 'installments' => 2], [[$monitor, 1, 800], [$mouse, 1, 50]]);
    $this->travel(1)->hours();
    // total 40, profit 40 - 20 = 20
    $this->crediarioSale = makeListingSale($this->company, ['customer_id' => $ana->id, 'date' => '2026-10-20', 'payment_method' => 'crediario', 'status' => 'pending'], [[$mouse, 1, 40]]);
    $this->travelBack();

    // Another company with matching names must never show up.
    $otherCompany = makeListingCompany('61000000000002');
    $otherBrand = Brand::query()->create(['company_id' => $otherCompany->id, 'name' => 'Logitech', 'status' => 'active']);
    $otherCategory = Category::query()->create(['company_id' => $otherCompany->id, 'name' => 'Periféricos', 'status' => 'active']);
    $otherProduct = Product::query()->create([
        'company_id' => $otherCompany->id,
        'category_id' => $otherCategory->id,
        'brand_id' => $otherBrand->id,
        'name' => 'Mouse sem fio',
        'sku' => 'MOU',
        'sale_price' => 40,
        'cost' => 20,
        'stock' => 10,
        'status' => 'active',
    ]);
    $otherCustomer = Customer::query()->create(['company_id' => $otherCompany->id, 'name' => 'Ana Souza', 'status' => 'active']);
    $this->otherSale = makeListingSale($otherCompany, ['customer_id' => $otherCustomer->id, 'date' => '2026-11-02'], [[$otherProduct, 1, 9999]]);
});

function listedSaleIds(array $query = []): array
{
    return listSales($query)->assertOk()->json('data.*.id');
}

test('lists sales newest first with 15 per page when no parameters are sent', function () {
    listSales()
        ->assertOk()
        ->assertJsonPath('meta.per_page', 15)
        ->assertJsonPath('meta.total', 4)
        ->assertJsonPath('data.0.id', $this->crediarioSale->id)
        ->assertJsonPath('data.0.customer_name', 'Ana Souza')
        ->assertJsonPath('data.0.items.0.product_name', 'Mouse sem fio')
        ->assertJsonPath('data.0.items.0.category_name', 'Periféricos')
        ->assertJsonPath('data.0.items.0.brand_name', 'Logitech');

    expect(listedSaleIds())->toBe([
        $this->crediarioSale->id,
        $this->cardSale->id,
        $this->pixSale->id,
        $this->cashSale->id,
    ]);
});

test('each sale in the list carries its discount and profit', function () {
    $sales = collect(listSales()->json('data'))->keyBy('id');

    expect($sales[$this->pixSale->id]['discount'])->toEqual(95)
        ->and($sales[$this->pixSale->id]['profit'])->toEqual(5)
        ->and($sales[$this->cardSale->id]['discount'])->toEqual(0)
        ->and($sales[$this->cardSale->id]['profit'])->toEqual(330)
        ->and($sales[$this->cashSale->id]['profit'])->toEqual(60);
});

test('the customer filter matches part of the customer name', function () {
    expect(listedSaleIds(['filter' => ['customer' => 'ana']]))
        ->toEqualCanonicalizing([$this->cashSale->id, $this->crediarioSale->id])
        ->and(listedSaleIds(['filter' => ['customer' => 'lima']]))->toBe([$this->pixSale->id]);
});

test('the product filter matches any item of the sale', function () {
    expect(listedSaleIds(['filter' => ['product' => 'mouse']]))
        ->toEqualCanonicalizing([$this->cashSale->id, $this->cardSale->id, $this->crediarioSale->id])
        ->and(listedSaleIds(['filter' => ['product' => 'teclado']]))->toBe([$this->pixSale->id])
        ->and(listedSaleIds(['filter' => ['product' => '%']]))->toBe([]);
});

test('the category and brand filters match any item of the sale', function () {
    expect(listedSaleIds(['filter' => ['category_id' => $this->monitors->id]]))->toBe([$this->cardSale->id])
        ->and(listedSaleIds(['filter' => ['brand_id' => $this->samsung->id]]))->toBe([$this->cardSale->id])
        ->and(listedSaleIds(['filter' => ['brand_id' => $this->logitech->id]]))->toHaveCount(4)
        ->and(listedSaleIds(['filter' => ['category_id' => $this->peripherals->id, 'brand_id' => $this->samsung->id]]))->toBe([$this->cardSale->id]);
});

test('the status and payment method filters match exactly', function () {
    expect(listedSaleIds(['filter' => ['status' => 'pending']]))
        ->toEqualCanonicalizing([$this->pixSale->id, $this->crediarioSale->id])
        ->and(listedSaleIds(['filter' => ['status' => 'cancelled']]))->toBe([$this->cardSale->id])
        ->and(listedSaleIds(['filter' => ['payment_method' => 'crediario']]))->toBe([$this->crediarioSale->id])
        ->and(listedSaleIds(['filter' => ['payment_method' => 'card_debit']]))->toBe([]);
});

test('sorts by total in both directions', function () {
    expect(listedSaleIds(['sort' => 'total', 'direction' => 'asc']))->toBe([
        $this->crediarioSale->id, // 40
        $this->pixSale->id, // 55
        $this->cashSale->id, // 100
        $this->cardSale->id, // 850
    ])->and(listedSaleIds(['sort' => 'total', 'direction' => 'desc']))->toBe([
        $this->cardSale->id,
        $this->cashSale->id,
        $this->pixSale->id,
        $this->crediarioSale->id,
    ]);
});

test('sorts by profit in both directions', function () {
    expect(listedSaleIds(['sort' => 'profit', 'direction' => 'asc']))->toBe([
        $this->pixSale->id, // 5
        $this->crediarioSale->id, // 20
        $this->cashSale->id, // 60
        $this->cardSale->id, // 330
    ])->and(listedSaleIds(['sort' => 'profit', 'direction' => 'desc']))->toBe([
        $this->cardSale->id,
        $this->cashSale->id,
        $this->crediarioSale->id,
        $this->pixSale->id,
    ]);
});

test('sorts by sale date', function () {
    expect(listedSaleIds(['sort' => 'date', 'direction' => 'asc']))->toBe([
        $this->crediarioSale->id, // 2026-10-20
        $this->cashSale->id, // 2026-11-01
        $this->pixSale->id, // 2026-11-03
        $this->cardSale->id, // 2026-11-10
    ]);
});

test('paginates on the server, also when sorting by profit', function () {
    listSales(['per_page' => 2, 'page' => 2])
        ->assertOk()
        ->assertJsonPath('meta.total', 4)
        ->assertJsonPath('meta.last_page', 2)
        ->assertJsonPath('meta.current_page', 2);

    expect(listedSaleIds(['per_page' => 2, 'page' => 2]))->toBe([$this->pixSale->id, $this->cashSale->id])
        ->and(listedSaleIds(['per_page' => 3, 'page' => 2, 'sort' => 'profit', 'direction' => 'desc']))->toBe([$this->pixSale->id]);
});

test('the period filter uses the sale date and includes both ends', function () {
    expect(listedSaleIds(['date_from' => '2026-11-01', 'date_to' => '2026-11-03']))
        ->toEqualCanonicalizing([$this->cashSale->id, $this->pixSale->id])
        ->and(listedSaleIds(['date_from' => '2026-11-04']))->toBe([$this->cardSale->id])
        ->and(listedSaleIds(['date_to' => '2026-10-31']))->toBe([$this->crediarioSale->id]);
});

test('rejects invalid table parameters', function (array $query, string $field) {
    listSales($query)->assertUnprocessable()->assertJsonValidationErrors($field);
})->with([
    'unknown sort' => [['sort' => 'customer'], 'sort'],
    'invalid direction' => [['sort' => 'total', 'direction' => 'up'], 'direction'],
    'unknown filter' => [['filter' => ['seller' => 'x']], 'filter'],
    'invalid status' => [['filter' => ['status' => 'open']], 'filter.status'],
    'invalid payment method' => [['filter' => ['payment_method' => 'boleto']], 'filter.payment_method'],
    'non numeric category' => [['filter' => ['category_id' => 'abc']], 'filter.category_id'],
    'page size above the limit' => [['per_page' => 101], 'per_page'],
    'date in another format' => [['date_from' => '01/11/2026'], 'date_from'],
    'period ending before it starts' => [['date_from' => '2026-11-10', 'date_to' => '2026-11-01'], 'date_to'],
]);

test('only lists sales of the current company', function () {
    $ids = listedSaleIds(['filter' => ['customer' => 'ana', 'product' => 'mouse'], 'per_page' => 100]);

    expect($ids)->not->toContain($this->otherSale->id)
        ->and($ids)->toEqualCanonicalizing([$this->cashSale->id, $this->crediarioSale->id])
        ->and(listedSaleIds(['sort' => 'total', 'direction' => 'desc'])[0])->toBe($this->cardSale->id);
});

test('older payment methods can still be filtered', function () {
    $legacySale = makeListingSale($this->company, ['date' => '2026-10-01', 'payment_method' => 'installment', 'status' => 'completed'], [[Product::query()->where('company_id', $this->company->id)->first(), 1, 30]]);

    expect(listedSaleIds(['filter' => ['payment_method' => 'installment']]))->toBe([$legacySale->id])
        ->and(listedSaleIds(['filter' => ['payment_method' => 'card']]))->toBe([]);
});
