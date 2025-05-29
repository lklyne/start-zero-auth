import { cn } from '@/lib/utils'
import { Link, useNavigate } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router' // for convenience

type MouseDownLinkProps = LinkProps & {
	className?: string
}

export function MouseDownLink({
	children,
	className,
	...linkOpts // to, params, search, hash, state, etc.
}: MouseDownLinkProps) {
	const navigate = useNavigate()

	const handleMouseDown: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
		// Only handle a normal left-click without modifier keys
		if (e.button !== 0 || e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
			return
		}
		e.preventDefault() // stop the default click navigation
		navigate(linkOpts) // imperatively navigate right away
	}

	return (
		<Link {...linkOpts} className={cn(className)} onMouseDown={handleMouseDown}>
			{children}
		</Link>
	)
}
