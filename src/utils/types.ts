type Shift<T extends any[]> = ((...t: T) => any) extends (first: any, ...rest: infer Rest) => any ? Rest : never;

type ShiftUnion<P extends PropertyKey, T extends any[]> = T extends any[] ? (T[0] extends P ? Shift<T> : never) : never;

type DeepRequired<T> = { [K in keyof T]: T extends object ? DeepRequired<T[K]> : T[K] } & Required<T>;

type PickDeepRequired<T, P extends string[]> = T extends object
	? Omit<T, Extract<keyof T, P[0]>> &
			Required<{
				[K in Extract<keyof T, P[0]>]: NonNullable<PickDeepRequired<T[K], ShiftUnion<K, P>>>;
			}>
	: T;

type SplitResult<S extends string> = S extends `${infer A} ${infer B} ${infer C} ${infer D}` ? [A, B, C, D] : string[];

export type { DeepRequired, PickDeepRequired, SplitResult };
