import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
	name: z.string().min(2),
	email: z.string().email(),
	password: z.string().min(6),
});
type Form = z.infer<typeof schema>;

export default function Register() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Form>({ resolver: zodResolver(schema) });
	const onSubmit = (v: Form) => console.log("register form:", v);

	return (
		<div className="mx-auto mt-10 max-w-sm space-y-4">
			<h1 className="text-2xl font-semibold">Реєстрація</h1>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
				<input
					className="w-full rounded border p-2"
					placeholder="Імʼя"
					{...register("name")}
				/>
				{errors.name && (
					<p className="text-sm text-red-600">{errors.name.message}</p>
				)}
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
					type="button"
					className="rounded bg-emerald-600 px-4 py-2 text-white"
				>
					Зареєструватись
				</button>
			</form>
		</div>
	);
}
