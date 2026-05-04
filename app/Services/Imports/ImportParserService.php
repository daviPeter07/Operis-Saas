<?php

namespace App\Services\Imports;

use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

class ImportParserService
{
    /**
     * @return array<int, array<string, string|null>>
     */
    public function parse(UploadedFile $file): array
    {
        $extension = strtolower($file->getClientOriginalExtension());

        if (! in_array($extension, ['csv', 'txt'], true)) {
            throw ValidationException::withMessages([
                'file' => 'Nesta fase, use arquivo CSV para importacao.',
            ]);
        }

        $handle = fopen($file->getRealPath(), 'rb');
        if (! $handle) {
            throw ValidationException::withMessages(['file' => 'Nao foi possivel ler o arquivo.']);
        }

        $header = fgetcsv($handle);
        if (! $header) {
            fclose($handle);

            return [];
        }

        $normalizedHeader = array_map(fn ($item): string => strtolower(trim((string) $item)), $header);
        $rows = [];

        while (($line = fgetcsv($handle)) !== false) {
            $assoc = [];
            foreach ($normalizedHeader as $index => $column) {
                $assoc[$column] = isset($line[$index]) ? trim((string) $line[$index]) : null;
            }
            $rows[] = $assoc;
        }

        fclose($handle);

        return $rows;
    }
}
