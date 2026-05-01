import * as React from 'react';
import { SearchableSelect } from '@/components/searchable-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCityOptionsByState, STATE_OPTIONS } from '@/constants/location-source';

type StateCityFilterProps = {
    stateValue: string;
    cityValue: string;
    onStateChange: (value: string) => void;
    onCityChange: (value: string) => void;
    disabled?: boolean;
};

export function StateCityFilter({
    stateValue,
    cityValue,
    onStateChange,
    onCityChange,
    disabled,
}: StateCityFilterProps) {
    const cityOptions = React.useMemo(
        () => getCityOptionsByState(stateValue),
        [stateValue],
    );

    return (
        <div className="grid gap-2 sm:grid-cols-2">
            <Select
                value={stateValue || '__none'}
                onValueChange={(value) => {
                    const nextState = value === '__none' ? '' : value;
                    onStateChange(nextState);
                    onCityChange('');
                }}
                disabled={disabled}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Estado (opcional)" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="__none">Todos os estados</SelectItem>
                    {STATE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <SearchableSelect
                value={cityValue}
                onChange={onCityChange}
                options={cityOptions}
                placeholder={
                    stateValue
                        ? 'Pesquisar cidade (opcional)'
                        : 'Selecione um estado primeiro'
                }
                allowCustomValue={false}
                disabled={!stateValue || disabled}
                className={!stateValue ? 'opacity-60' : ''}
            />
        </div>
    );
}
