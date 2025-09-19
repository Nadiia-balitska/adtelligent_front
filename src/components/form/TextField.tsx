import clsx from "clsx";
import type {
	FieldError,
	FieldValues,
	Path,
	UseFormRegister,
} from "react-hook-form";

type Props<T extends FieldValues> = {
	name: Path<T>;
	label?: string;
	type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
	placeholder?: string;
	autoComplete?: string;
	register: UseFormRegister<T>;
	error?: FieldError;
	className?: string;
};

export default function TextField<T extends FieldValues>({
	name,
	label,
	type = "text",
	placeholder,
	autoComplete,
	register,
	error,
	className,
}: Props<T>) {
	const id = `field-${String(name)}`;

	return (
		<label htmlFor={id} className="block space-y-1">
			{label && <span className="text-sm">{label}</span>}

			<input
				id={id}
				type={type}
				placeholder={placeholder}
				autoComplete={autoComplete}
				{...register(name)}
				aria-invalid={!!error}
				aria-describedby={error ? `${id}-error` : undefined}
				className={clsx(
					"w-full rounded-md border px-3 py-2 outline-none",
					"focus:ring focus:ring-blue-500/30",
					"dark:border-zinc-700 dark:bg-zinc-900",
					error && "border-red-500 focus:ring-red-500/30",
					className,
				)}
			/>

			{error && (
				<span id={`${id}-error`} className="block text-xs text-red-600">
					{error.message}
				</span>
			)}
		</label>
	);
}
