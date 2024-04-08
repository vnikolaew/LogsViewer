type AwaitedReturnTypeOf<T extends (...params: any[]) => void> = Awaited<ReturnType<T>>;
