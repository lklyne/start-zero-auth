import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { useForm } from '@tanstack/react-form'

function FieldError({ error }: { error?: string }) {
	return error ? <p className='text-red-500 text-sm mt-1'>{error}</p> : null
}

export function FormAddress() {
	const form = useForm({
		defaultValues: {
			fullName: '',
			email: '',
			address: {
				street: '',
				city: '',
				state: '',
				zipCode: '',
				country: '',
			},
			phone: '',
		},
		validators: {
			onChangeAsyncDebounceMs: 500,
			onChange: ({ value }) => {
				if (value.fullName.trim().length === 0) {
					// You might return general form errors here if needed
				}
				return undefined
			},
		},
		onSubmit: ({ value }) => {
			console.log(value)
			alert('Form submitted successfully!')
		},
	})

	return (
		<div className='container'>
			<div className='flex flex-col border m-4 bg-background'>
				<div className='flex items-center gap-2 w-full justify-between px-4 border-b pb-2 pt-2'>
					<h2 className='font-semibold text-sm'>Address Form</h2>
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
							name='fullName'
							validators={{
								onChange: ({ value }) =>
									!value || value.trim().length === 0
										? 'Full name is required'
										: undefined,
							}}
							children={(field) => (
								<div className='space-y-1'>
									<Label htmlFor={field.name}>Full Name</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									<FieldError error={field.state.meta.errors.join(', ')} />
								</div>
							)}
						/>

						<form.Field
							name='email'
							validators={{
								onChange: ({ value }) => {
									if (!value || value.trim().length === 0) {
										return 'Email is required'
									}
									if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
										return 'Invalid email address'
									}
									return undefined
								},
							}}
							children={(field) => (
								<div className='space-y-1'>
									<Label htmlFor={field.name}>Email</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										type='email'
									/>
									<FieldError error={field.state.meta.errors.join(', ')} />
								</div>
							)}
						/>

						<form.Field
							name='address.street'
							validators={{
								onChange: ({ value }) => {
									if (!value || value.trim().length === 0) {
										return 'Street address is required'
									}
									return undefined
								},
							}}
							children={(field) => (
								<div className='space-y-1'>
									<Label htmlFor={field.name}>Street Address</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									<FieldError error={field.state.meta.errors.join(', ')} />
								</div>
							)}
						/>

						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							<form.Field
								name='address.city'
								validators={{
									onChange: ({ value }) => {
										if (!value || value.trim().length === 0) {
											return 'City is required'
										}
										return undefined
									},
								}}
								children={(field) => (
									<div className='space-y-1'>
										<Label htmlFor={field.name}>City</Label>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										<FieldError error={field.state.meta.errors.join(', ')} />
									</div>
								)}
							/>
							<form.Field
								name='address.state'
								validators={{
									onChange: ({ value }) => {
										if (!value || value.trim().length === 0) {
											return 'State is required'
										}
										return undefined
									},
								}}
								children={(field) => (
									<div className='space-y-1'>
										<Label htmlFor={field.name}>State</Label>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										<FieldError error={field.state.meta.errors.join(', ')} />
									</div>
								)}
							/>
							<form.Field
								name='address.zipCode'
								validators={{
									onChange: ({ value }) => {
										if (!value || value.trim().length === 0) {
											return 'Zip code is required'
										}
										if (!/^\d{5}(-\d{4})?$/.test(value)) {
											return 'Invalid zip code format'
										}
										return undefined
									},
								}}
								children={(field) => (
									<div className='space-y-1'>
										<Label htmlFor={field.name}>Zip Code</Label>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										<FieldError error={field.state.meta.errors.join(', ')} />
									</div>
								)}
							/>
						</div>

						<form.Field
							name='address.country'
							validators={{
								onChange: ({ value }) => {
									if (!value || value.trim().length === 0) {
										return 'Country is required'
									}
									return undefined
								},
							}}
							children={(field) => (
								<div className='space-y-1'>
									<Label htmlFor={field.name}>Country</Label>
									<Select
										value={field.state.value}
										onValueChange={(value) => field.handleChange(value)}
										name={field.name}
									>
										<SelectTrigger id={field.name} className='w-full'>
											<SelectValue placeholder='Select a country' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='US'>United States</SelectItem>
											<SelectItem value='CA'>Canada</SelectItem>
											<SelectItem value='UK'>United Kingdom</SelectItem>
											<SelectItem value='AU'>Australia</SelectItem>
											<SelectItem value='DE'>Germany</SelectItem>
											<SelectItem value='FR'>France</SelectItem>
											<SelectItem value='JP'>Japan</SelectItem>
										</SelectContent>
									</Select>
									<FieldError error={field.state.meta.errors.join(', ')} />
								</div>
							)}
						/>

						<form.Field
							name='phone'
							validators={{
								onChange: ({ value }) => {
									if (!value || value.trim().length === 0) {
										return 'Phone number is required'
									}
									if (!/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(value)) {
										return 'Invalid phone number format (e.g., 123-456-7890)'
									}
									return undefined
								},
							}}
							children={(field) => (
								<div className='space-y-1'>
									<Label htmlFor={field.name}>Phone</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder='123-456-7890'
										type='tel'
									/>
									<FieldError error={field.state.meta.errors.join(', ')} />
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
