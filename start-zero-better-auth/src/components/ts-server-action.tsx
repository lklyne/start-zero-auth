import * as fs from 'node:fs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Route as TanstackExamplesRoute } from '@/routes/_authed/app/_layout/tanstack-examples'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'

const filePath = 'count.txt'

async function readCount() {
	return Number.parseInt(
		await fs.promises.readFile(filePath, 'utf-8').catch(() => '0'),
	)
}

const getCount = createServerFn({
	method: 'GET',
}).handler(() => {
	return readCount()
})

const updateCount = createServerFn({
	method: 'POST',
	response: 'raw', // Tell TanStack we want to return a raw Response
})
	.validator((formData: FormData | unknown) => {
		if (!(formData instanceof FormData)) {
			const data = new FormData()
			data.set('addBy', '1')
			return data
		}
		return formData
	})
	.handler(async ({ data: formData }) => {
		const addBy = Number(formData.get('addBy') || '1')
		const count = await readCount()
		await fs.promises.writeFile(filePath, `${count + addBy}`)

		// Return a response that works both with JS and without JS
		return new Response('ok', {
			status: 303, // 303 See Other
			headers: {
				Location: '/_authed/app/_layout/tanstack-examples',
			},
		})
	})

// Create a loader function that we can use in the route
export const tsServerActionLoader = async () => await getCount()

export function TsServerAction() {
	const { tsServerAction: state } = TanstackExamplesRoute.useLoaderData()
	const [addByValue, setAddByValue] = useState('1')

	return (
		<div className='container'>
			<div className='flex flex-col border m-4 bg-background'>
				<div className='flex items-center gap-2 w-full justify-between px-4 border-b pb-2 pt-2'>
					<h2 className='font-semibold text-sm'>Server Action Counter</h2>
				</div>
				<div className='p-4 flex flex-col gap-4'>
					<p className='text-sm'>
						This example demonstrates a TanStack Start server action that
						maintains a counter in a file. It uses progressive enhancement to
						work with and without JavaScript, handling form submissions and
						automatic redirects through TanStack's createServerFn utility.
					</p>
					<p className='text-sm'>
						This is poorly implemented. It invalidates the entire router
						context, causing the zero instance to reload.
					</p>

					<form
						action={updateCount.url}
						method='POST'
						onSubmit={async (e) => {
							e.preventDefault()
							const form = e.currentTarget
							const formData = new FormData(form)
							await updateCount({ data: formData })
							// The server will handle the redirect, and the router will handle it client-side when JS is enabled
						}}
					>
						<div className='flex items-center gap-2'>
							<Input
								type='number'
								name='addBy'
								value={addByValue}
								onChange={(e) => setAddByValue(e.target.value)}
							/>
							<Button type='submit' size='sm'>
								Add {addByValue} to {state}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}
