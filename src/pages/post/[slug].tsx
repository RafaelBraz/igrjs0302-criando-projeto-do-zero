import { GetStaticPaths, GetStaticProps } from 'next'
import { RichText } from 'prismic-dom'
import Prismic from '@prismicio/client'
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi'

import { getPrismicClient } from '../../services/prismic'

import styles from './post.module.scss'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/router'

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

function calculateReadTime(content) {
  const wordsCount = content.reduce((acc, content) => {
    let words = 0
    words += content.heading.split(' ').length
    content.body.forEach(element => {
      words += element.text.replace(/(\r\n|\n|\r)/gm, '').split(' ').length
    });

    return acc + words
  }, 0)


  return Math.ceil(wordsCount/200)
}

export default function Post({ post }: PostProps) {
  const router = useRouter()

  if (router.isFallback) {
      return <h1>Carregando...</h1>
  }

  const readTime = calculateReadTime(post.data.content)

  return (
    <>
      <div className={styles.imageContainer}>
        <img src={post.data.banner.url} />
      </div>

      <div className={styles.container}>
        <h1>{post.data.title}</h1>
        
        <div className={styles.infos}>
          <FiCalendar width={'20px'} height={'20px'} color='#BBBBBB' />
          <span>{
            format(
              new Date(post.first_publication_date),
              "dd MMM yyyy",
              {
                locale: ptBR,
              }
            )
          }</span>
          
          <FiUser width={'20px'} height={'20px'} color='#BBBBBB' />
          <span>{post.data.author}</span>

          <FiClock width={'20px'} height={'20px'} color='#BBBBBB' />
          <span>{`${readTime} min`}</span>
        </div>
        
        <div className={styles.content}>
          {post.data.content.map(content => {
            return (
              <>
                <h2>{content.heading}</h2>
                <div
                  className={styles.postContent}
                  dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body) }} 
                />
              </>
            )
          })}
        </div>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ])

  //TODO: Pegar todos os posts até não haverem mais - aqui só pega os primeiros
  // 20 posts (usar ISR ou algo assim)
  let posts = postsResponse.results
  // while(postsResponse.next_page) {
  //   const response = await fetch(postsResponse.next_page)
  //   const resJson = await response.json()

  //   posts = [...posts, ...resJson.results]
  // }

  return {
    paths: posts.map(post => {
      return { params: { slug: post.uid } }
    }),
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url 
      },
      author: response.data.author,
      content: response.data.content
    }
  }

  return {
    props: {
      post
    }
  }
};
