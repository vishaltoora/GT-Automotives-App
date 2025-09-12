import { TireFiltersDto } from '@gt-automotive/shared-dto';
interface TireFilterProps {
    filters: TireFiltersDto;
    onChange: (filters: TireFiltersDto) => void;
    onClear: () => void;
    isCompact?: boolean;
}
export declare function TireFilter({ filters, onChange, onClear, isCompact }: TireFilterProps): import("react/jsx-runtime").JSX.Element;
export default TireFilter;
//# sourceMappingURL=TireFilter.d.ts.map