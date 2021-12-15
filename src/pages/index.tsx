import { GetStaticProps } from 'next'
import Prismic from '@prismicio/client'

import PostItem from '../components/PostItem'
import { getPrismicClient } from '../services/prismic'

import styles from './home.module.scss'
import { useEffect, useState } from 'react'

interface Post {
  uid: string
  first_publication_date: string | null
  data: {
    title: string
    subtitle: string
    author: string
  };
}

interface PostPagination {
  next_page: string
  results: Post[]
}

interface HomeProps {
  postsPagination: PostPagination
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [nextPage, setNextPage] = useState(null)

  useEffect(() => {
    setPosts([...postsPagination.results])
    setNextPage(postsPagination.next_page)
  }, [])

  async function handleNextPage() {
    const response = await fetch(nextPage)
    const resJson = await response.json()

    const newPosts = resJson.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: post.data
      }
    })

    setNextPage(resJson.next_page)
    setPosts([...posts, ...newPosts])
  }

  return (
    <div className={styles.container}>
      <div>
        { posts.map(post => {
          return (
            <PostItem key={post.uid} post={post}/>
          )
        })}
      </div>
      { nextPage && <button onClick={handleNextPage}>Carregar mais posts</button> }
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch : ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 2,
  })

  return {
    props: {
      postsPagination: {
        results: postsResponse.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: post.data
          }
        }),
        next_page: postsResponse.next_page
      }
    }
  }
};
