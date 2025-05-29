import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

const schema = z.object({
	title: z.string().min(1, 'Title is required'),
	description: z.string().min(1, 'Description is required'),
})

function FieldError({ error }: { error?: string }) {
	return error ? <p className='text-red-500 text-sm mt-1'>{error}</p> : null
}

export function FormSimple() {
	const form = useForm({
		defaultValues: {
			title: '',
			description: '',
		},
		onSubmit: ({ value }: { value: z.infer<typeof schema> }) => {
			console.log(value)
			alert('Form submitted successfully!')
		},
	})

	return (
		<div className='container'>
			<div className='flex flex-col border m-4 bg-background'>
				<div className='flex items-center gap-2 w-full justify-between px-4 border-b pb-2 pt-2'>
					<h2 className='font-semibold text-sm'>Simple Form</h2>
				</div>
				<div className='p-4'>
					<form
						onSubmit={(e) => {
							e.preventDefault()
							e.stopPropagation()
							form.handleSubmit()
						}}
						className='space-y-6'
					>
						<form.Field
							name='title'
							validators={{
								onChange: ({ value }) => {
									const result = schema.shape.title.safeParse(value)
									return result.success
										? undefined
										: result.error.errors[0].message
								},
							}}
							children={(field) => (
								<div className='space-y-1'>
									<Label htmlFor={field.name}>Title</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									<FieldError error={field.state.meta.errors[0]} />
								</div>
							)}
						/>

						<form.Field
							name='description'
							validators={{
								onChange: ({ value }) => {
									const result = schema.shape.description.safeParse(value)
									return result.success
										? undefined
										: result.error.errors[0].message
								},
							}}
							children={(field) => (
								<div className='space-y-1'>
									<Label htmlFor={field.name}>Description</Label>
									<Textarea
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									<FieldError error={field.state.meta.errors[0]} />
								</div>
							)}
						/>

						<div className='flex justify-end'>
							<form.Subscribe
								selector={(state) => [state.canSubmit, state.isSubmitting]}
								children={([canSubmit, isSubmitting]) => (
									<Button
										type='submit'
										size='sm'
										disabled={!canSubmit || isSubmitting}
									>
										{isSubmitting ? 'Submitting...' : 'Submit'}
									</Button>
								)}
							/>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}
