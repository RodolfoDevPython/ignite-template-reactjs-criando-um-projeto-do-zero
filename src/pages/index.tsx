import { format } from 'date-fns';
import { GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';

import { FiCalendar, FiUser } from "react-icons/fi";

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
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

export default function Home(props: HomeProps) {
  // TODO

  const { results, next_page } = props.postsPagination;

  console.log({
    results, 
    next_page
  })

  return (
    <div className={styles.container}>
      { results.map( post => (
        <div className={styles.post}>
          <p className={styles.title}>{RichText.asText(post.data.titlePost)}</p>
          <p className={styles.subTitle} >{RichText.asText(post.data.subTitle)}</p>
          <div className={styles.dateAndAuthor}>
            <span>
              <FiCalendar color='#BBBBBB' />
              <time>
                {format(new Date(post.first_publication_date), `d MMM yyyy`)}
              </time>
            </span>
            <span>
              <FiUser color='#BBBBBB' />
              <p>{RichText.asText(post.data.nameAuthor)}</p>  
            </span>
          </div>
        </div>
      )) }
    </div>
  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('post');

  return {
    props: {
      postsPagination: postsResponse
    }
  }

};
