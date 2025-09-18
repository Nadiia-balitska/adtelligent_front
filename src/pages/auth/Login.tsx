import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
	email: z.string().email("email not corect"),
	password: z.string().min(3, "min 3 characters"),
});
type Form = z.infer<typeof schema>;

export default function Login() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Form>({ resolver: zodResolver(schema) });

	const onSubmit = (v: Form) => console.log("login form:", v);

	return (
		<div className="mx-auto mt-10 max-w-sm space-y-4">
			<h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
				Вхід
			</h1>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
				<input
					className="w-full rounded border p-2"
					placeholder="Email"
					{...register("email")}
				/>
				{errors.email && (
					<p className="text-sm text-red-600">{errors.email.message}</p>
				)}
				<input
					className="w-full rounded border p-2"
					type="password"
					placeholder="Пароль"
					{...register("password")}
				/>
				{errors.password && (
					<p className="text-sm text-red-600">{errors.password.message}</p>
				)}
				<button
					type="submit"
					className="rounded bg-blue-600 px-4 py-2 text-white"
				>
					Увійти
				</button>
			</form>
		</div>
	);
}
