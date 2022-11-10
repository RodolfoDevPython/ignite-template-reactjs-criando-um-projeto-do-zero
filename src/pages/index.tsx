import { format } from 'date-fns';
import { GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';

import Link from "next/link"

import { FiCalendar, FiUser } from "react-icons/fi";

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid: string;
  first_publication_date: string;
  data: {
    titlePost: string;
    subTitle: string;
    nameAuthor: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;

}

export default function Home({ postsPagination }: HomeProps) {
  // TODO

  if (!postsPagination) return

  const { results, next_page } = postsPagination;
  
  return (
    <div className={commonStyles.container}>
      { results?.map( post => (
        <div className={styles.post} key={post?.uid} >
          <Link href={`/post/${post?.uid}`} prefetch={false} >
            <div>
              <p className={commonStyles.title}>{post?.data?.titlePost}</p>
              <p className={commonStyles.subTitle} >{post?.data?.subTitle}</p>
              <div className={commonStyles.dateAndAuthor}>
                <span>
                  <FiCalendar color='#BBBBBB' />
                  <time>
                    {format(new Date(post?.first_publication_date), `d MMM yyyy`)}
                  </time>
                </span>
                <span>
                  <FiUser color='#BBBBBB' />
                  <p>{post?.data?.nameAuthor}</p>  
                </span>
              </div>
            </div>
          </Link>
        </div>
      )) }

      {next_page && <button className={styles.buttonLoadMore}>carregar mais</button>}
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('post');


  const posts = postsResponse.results?.map(post => {
    const { 
      titlePost,
      subTitle, 
      nameAuthor
    } = post?.data;
    return {
      uid: post.uid,
      first_publication_date: post?.first_publication_date,
      data: {
        subTitle: typeof subTitle == 'object' ? RichText?.asText(subTitle) : subTitle,  
        titlePost: typeof titlePost == 'object' ? RichText?.asText(titlePost) : titlePost,
        nameAuthor: typeof nameAuthor == 'object' ? RichText?.asText(nameAuthor) : nameAuthor
      } 
    };
  });

  return {
    props: {
      postsPagination: {
        ...postsResponse,
        next_page: postsResponse.next_page,
        results: posts
      },
      revalidate: 60, // 24 hours
    }
  }

};
