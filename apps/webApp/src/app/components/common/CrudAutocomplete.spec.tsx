import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { CrudAutocomplete } from './CrudAutocomplete';

interface Person {
  id: string;
  name: string;
  phone: string;
}

// Two "Bob Brown"s on purpose: MUI keys rows by label unless getOptionKey says
// otherwise, and colliding keys used to leave stale rows behind as the filter
// narrowed.
const people: Person[] = [
  { id: '1', name: 'Alice Anderson', phone: '250-111-1111' },
  { id: '2', name: 'Bob Brown', phone: '250-222-2222' },
  { id: '3', name: 'Carol Clark', phone: '250-333-3333' },
  { id: '4', name: 'Bob Brown', phone: '250-444-4444' },
];

function Harness() {
  const [value, setValue] = useState<Person | null>(null);
  return (
    <CrudAutocomplete<Person>
      label="Customer"
      entityLabel="customer"
      options={people}
      value={value}
      onChange={setValue}
      getOptionId={(p) => p.id}
      getOptionLabel={(p) => p.name}
      getOptionSearchText={(p) => p.phone}
      renderOptionContent={(p) => (
        <span>
          {p.name} {p.phone}
        </span>
      )}
      onAdd={() => undefined}
      onEdit={() => undefined}
    />
  );
}

const rows = () => screen.queryAllByRole('option').map((o) => o.textContent);

const openList = () => {
  const input = screen.getByRole('combobox') as HTMLInputElement;
  fireEvent.mouseDown(input);
  fireEvent.focus(input);
  return input;
};

describe('CrudAutocomplete', () => {
  it('narrows the list on every keystroke, including same-named options', () => {
    render(<Harness />);
    const input = openList();
    expect(rows()).toHaveLength(4);

    fireEvent.change(input, { target: { value: 'b' } });
    expect(rows()).toEqual([
      'Bob Brown 250-222-2222',
      'Bob Brown 250-444-4444',
    ]);

    fireEvent.change(input, { target: { value: 'bob br' } });
    expect(rows()).toEqual([
      'Bob Brown 250-222-2222',
      'Bob Brown 250-444-4444',
    ]);

    fireEvent.change(input, { target: { value: 'bob brz' } });
    expect(rows()).toHaveLength(0);

    // Deleting characters widens it back out.
    fireEvent.change(input, { target: { value: 'clark' } });
    expect(rows()).toEqual(['Carol Clark 250-333-3333']);

    // Clearing the text restores the full list.
    fireEvent.change(input, { target: { value: '' } });
    expect(rows()).toHaveLength(4);
  });

  it('matches on the extra search text as well as the label', () => {
    render(<Harness />);
    const input = openList();

    fireEvent.change(input, { target: { value: '444' } });
    expect(rows()).toEqual(['Bob Brown 250-444-4444']);
  });
});
