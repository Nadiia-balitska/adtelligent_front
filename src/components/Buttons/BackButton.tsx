import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type BackButtonProps = {
	children?: ReactNode;
	to?: -1 | string;
	replace?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
		onClick?: () => void;
	};

export default function BackButton({
	children = "← Назад",
	to = -1,
	replace = false,
	onClick,
	className = "",
	...rest
}: BackButtonProps) {
	const navigate = useNavigate();

	const handleClick = () => {
		if (onClick) return onClick();
		if (typeof to === "number") navigate(to);
		else navigate(to, { replace });
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			className={
				"inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm " +
				"bg-zinc-200 text-zinc-900 hover:bg-zinc-300 " +
				"dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 " +
				"focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 " +
				className
			}
			{...rest}
		>
			{children}
		</button>
	);
}
