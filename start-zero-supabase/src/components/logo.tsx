import { Binary } from 'lucide-react'

const Logo = () => {
	return (
		<div className='flex items-center p-0.5 rounded text-white bg-gradient-to-br from-stone-500 to-stone-800 border border-stone-700 shadow'>
			<Binary
				className='h-4 w-4 [text-shadow:1px_2px_2px_rgba(0,0,0,1)]'
				aria-hidden={true}
			/>
		</div>
	)
}

export default Logo
