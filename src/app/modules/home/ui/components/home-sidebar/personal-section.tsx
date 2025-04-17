"use client";

import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { HistoryIcon, ListVideoIcon, ThumbsUpIcon } from 'lucide-react';
import { useAuth, useClerk } from '@clerk/nextjs';
import Link from 'next/link';

const items = [
	{
		title: 'History',
		url: '/playlist/history',
		icon: HistoryIcon,
        auth: true,
	},
	{
		title: 'Liked videos',
		url: '/playlist/liked',
		icon: ThumbsUpIcon,
		auth: true,
	},
	{
		title: 'All playlist',
		url: '/playlist',
		icon: ListVideoIcon,
        auth: true,
	},
];

export const PersonalSection = () => {
    const clerk = useClerk();
	const { isSignedIn } = useAuth();

	return (
		<SidebarGroup>
            <SidebarGroupLabel>You</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton 
                                tooltip={item.title} 
                                asChild 
                                isActive={false} // TODO: Look at current path name
                                onClick={(e) => {
                                    if (!isSignedIn && item.auth) {
                                        e.preventDefault()
                                        return clerk.openSignIn();
                                    }
                                }} 
                            > 
								<Link href={item.url} className="flex items-center gap-4">
									<item.icon/>
                                    <span className='text-sm'>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
};
