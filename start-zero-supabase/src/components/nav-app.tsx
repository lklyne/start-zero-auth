import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import React from 'react'

interface NavAppProps {
	title?: string
	breadcrumbs?: {
		items: Array<{
			label: string
			href?: string
		}>
	}
	children?: React.ReactNode
}

const NavApp = ({ title, breadcrumbs, children }: NavAppProps) => {
	return (
		<div className='flex justify-between items-center border-b border-gray-200 h-12 px-4 sticky top-0 bg-background z-10 shrink-0'>
			<div className='flex items-center gap-2'>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<SidebarTrigger className='opacity-50 hover:opacity-100' />
						</TooltipTrigger>
						<TooltipContent>
							<p>
								Toggle sidebar{' '}
								<kbd className='ml-1 pointer-events-none inline-flex h-4 select-none items-center gap-2 rounded border border-muted-foreground px-1 font-mono text-xs font-medium text-muted opacity-100 bg-muted-foreground'>
									⌘ B
								</kbd>
							</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				{breadcrumbs ? (
					<Breadcrumb>
						<BreadcrumbList>
							{breadcrumbs.items.map((item, i) => (
								<React.Fragment key={`${item.label}-${item.href || 'current'}`}>
									<BreadcrumbItem>
										{i === breadcrumbs.items.length - 1 ? (
											<BreadcrumbPage>{item.label}</BreadcrumbPage>
										) : (
											<BreadcrumbLink asChild>
												<Link to={item.href}>{item.label}</Link>
											</BreadcrumbLink>
										)}
									</BreadcrumbItem>
									{i < breadcrumbs.items.length - 1 && (
										<BreadcrumbSeparator>
											<ChevronRight className='h-4 w-4' />
										</BreadcrumbSeparator>
									)}
								</React.Fragment>
							))}
						</BreadcrumbList>
					</Breadcrumb>
				) : (
					<h2 className='font-medium text-sm'>{title}</h2>
				)}
			</div>
			{children || <div />}
		</div>
	)
}

export default NavApp
