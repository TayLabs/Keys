import type { SelectedFields } from 'drizzle-orm';
import type { AnyPgTable } from 'drizzle-orm/pg-core';

export type ColumnKeysUnion<T extends readonly AnyPgTable[]> =
	T extends readonly [
		infer First extends AnyPgTable,
		...infer Rest extends AnyPgTable[]
	]
		?
				| `${
						| `${First['_']['name'] & string}.`
						| ''}${keyof First['_']['columns'] & string}`
				| ColumnKeysUnion<Rest>
		: never;

type ReturnColumnKeysUnion<T extends readonly AnyPgTable[]> =
	T extends readonly [
		infer First extends AnyPgTable,
		...infer Rest extends AnyPgTable[]
	]
		?
				| `${First['_']['name'] & string}${Capitalize<
						Extract<keyof First['_']['columns'], string>
				  >}`
				| ColumnKeysUnion<Rest>
		: never;

type IntersectSelectedFields<TTables extends readonly AnyPgTable[]> =
	TTables extends [
		infer Head extends AnyPgTable,
		...infer Tail extends AnyPgTable[]
	]
		? SelectedFields<any, Head> & IntersectSelectedFields<Tail>
		: {};

/**
 *	List Tables in the order you want to select and columns like 'id' will select the first table in the list (i.e. params like ([userTable, profileTable], ['id']) will select 'users.id').
 *  You can also specify 'table.column' if needed
 */
export function selectColumns<TTables extends readonly AnyPgTable[]>(
	tables: TTables,
	...columns: ColumnKeysUnion<TTables>[]
): IntersectSelectedFields<TTables> {
	const result: Partial<
		Record<
			ReturnColumnKeysUnion<TTables>,
			TTables[number][keyof TTables[number]]
		>
	> = {};

	for (const column of columns) {
		const parts = (column as string).split('.');
		const isExplicit = parts.length > 1;

		for (let i = 0; i < tables.length; i++) {
			const table = tables[i] as TTables[number];
			const currentTableName =
				table[
					Symbol.for('drizzle:BaseName') as keyof TTables[number]
				]?.toString();

			if (isExplicit && currentTableName === parts[0] && parts[1] in table) {
				const [tableName, columnName] = parts as [string, string];
				result[
					`${tableName}${columnName[0].toUpperCase()}${columnName.substring(
						1
					)}` as ReturnColumnKeysUnion<TTables>
				] = table[columnName as keyof TTables[number]];
				break;
			} else if (!isExplicit && parts[0] in table) {
				const [columnName] = parts as [string];
				result[column as ReturnColumnKeysUnion<TTables>] =
					table[columnName as keyof TTables[number]];
				break;
			}
		}
	}

	return result as IntersectSelectedFields<TTables>;
}
