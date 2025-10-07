import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import TextField from "../../components/form/TextField";
import schema from "../../schemas/schemaLogin";

import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthApi, queryKeys } from "../../services/auth";
type Form = z.infer<typeof schema>;

export default function Login() {
	const navigate = useNavigate();

	const qc = useQueryClient();

const loginMutation = useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: (data: Form) => AuthApi.login(data.email, data.password),
    onSuccess: () => {
		   qc.invalidateQueries({ queryKey: queryKeys.me });
      navigate("/dashboard");
    },
  });
	const {
		register,
		handleSubmit,
		formState: { errors },
		
	} = useForm<Form>({ resolver: zodResolver(schema) });


	 const onSubmit = (v: Form) => loginMutation.mutate(v);

	return (
		<div className="mx-auto mt-10 max-w-sm space-y-4">
			<h1 className="text-2xl font-bold">Вхід</h1>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
				<TextField<Form>
					name="email"
					label="Email"
					type="email"
					placeholder="name@example.com"
					autoComplete="email"
					register={register}
					error={errors.email}
				/>

				<TextField<Form>
					name="password"
					label="Пароль"
					type="password"
					placeholder="Пароль"
					autoComplete="current-password"
					register={register}
					error={errors.password}
				/>

				<button
					type="submit"
					className="w-full rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
				>
					Login
				</button>
			</form>
		</div>
	);
}
