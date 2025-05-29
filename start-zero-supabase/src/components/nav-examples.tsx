'use client'

import { Link, useMatches } from '@tanstack/react-router'
import { DatabaseZap, Mail, TreePalm, UserIcon, Users } from 'lucide-react'

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'

const items = [
	{
		title: 'Zero Mutations',
		url: '/app/zero-mutations',
		icon: DatabaseZap,
	},
	{
		title: 'Zero Users',
		url: '/app/users',
		icon: Users,
	},
	{
		title: 'Tanstack Examples',
		url: '/app/tanstack-examples',
		icon: TreePalm,
	},
	{
		title: 'Emails',
		url: '/app/email-preview',
		icon: Mail,
	},
	{
		title: 'Account',
		url: '/app/account',
		icon: UserIcon,
	},
]

export function NavExamples() {
	const matches = useMatches()
	const currentPath = matches[matches.length - 1]?.pathname

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Examples</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								asChild
								tooltip={item.title}
								isActive={currentPath === item.url}
							>
								<Link to={item.url}>
									{item.icon && <item.icon className='h-4 w-4' />}
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	)
}
