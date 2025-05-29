import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
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
			{children || <div />}
		</div>
	)
}

export default NavApp
