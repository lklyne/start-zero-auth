export class Atom<T> {
	#subs = new Set<(value: T | undefined) => void>()
	#val: T | undefined

	set value(value: T | undefined) {
		this.#val = value
		for (const listener of this.#subs) {
			listener(value)
		}
	}

	get value(): T | undefined {
		return this.#val
	}

	onChange = (cb: (value: T | undefined) => void): (() => void) => {
		this.#subs.add(cb)
		cb(this.#val)
		return () => {
			this.#subs.delete(cb)
		}
	}
}
