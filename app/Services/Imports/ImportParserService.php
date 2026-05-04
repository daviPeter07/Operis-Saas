<?php

namespace App\Services\Imports;

use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportParserService
{
    /**
     * @return array<int, array<string, string|null>>
     */
    public function parse(UploadedFile $file): array
    {
        $extension = strtolower($file->getClientOriginalExtension());

        if (! in_array($extension, ['csv', 'txt', 'xls', 'xlsx'], true)) {
            throw ValidationException::withMessages([
                'file' => 'Tipo de arquivo não suportado. Use CSV, TXT, XLS ou XLSX.',
            ]);
        }

        // Handle spreadsheet formats (XLS/XLSX)
        if (in_array($extension, ['xls', 'xlsx'], true)) {
            // Load the spreadsheet using PhpSpreadsheet
            $spreadsheet = IOFactory::load($file->getRealPath());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray(null, true, true, true);

            // First row is header; extract and normalize it
            $header = array_shift($rows);
            $normalizedHeader = array_map(fn ($item): string => strtolower(trim((string) $item)), $header);
            $parsedRows = [];

            foreach ($rows as $line) {
                $assoc = [];
                foreach ($normalizedHeader as $colLetter => $column) {
                    $value = $line[$colLetter] ?? null;
                    $assoc[$column] = is_string($value) ? trim($value) : $value;
                }
                $parsedRows[] = $assoc;
            }

            return $parsedRows;
        }

        // CSV handling continues below


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
