import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

import { FiCalendar, FiUser } from 'react-icons/fi'
import styles from './postItem.module.scss'

interface Post {
  uid?: string
  first_publication_date: string | null
  data: {
    title: string
    subtitle: string
    author: string
  };
}

interface PostItemProps {
	post: Post
}

export default function PostItem({ post }: PostItemProps) {
  return (
		<div className={styles.container}>
			<Link href={`/post/${post.uid}`}>
				<a>
					<h1>{post.data.title}</h1>
					<p>{post.data.subtitle}</p>
					<div>
						{/* icon 20x20 */}
						<FiCalendar width={'20px'} height={'20px'} color='#BBBBBB' />
						<span>
							{
								format(
									new Date(post.first_publication_date),
									"dd MMM yyyy",
									{
										locale: ptBR,
									}
								)
							}
						</span>
						
						<FiUser width={'20px'} height={'20px'} color='#BBBBBB' />
						<span>{post.data.author}</span>
					</div>
				</a>
			</Link>
		</div>
	)
}
