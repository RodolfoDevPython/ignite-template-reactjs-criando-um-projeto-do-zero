import { format } from 'date-fns';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    titlePost: string;
    subTitle: string;
    banner: {
      url: string;
    };
    nameAuthor: string;
    group: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post | any;
}

export default function Post({ post } : PostProps) {

  if (!post) return 
  
  return(
    <main>
      <div className={styles.banner}>
        <img src={post.data.banner.url} width="100%" height="400px" alt="" />
      </div>
      <section className={commonStyles.container} >
        <div>
          <p className={commonStyles.title}>{RichText.asText(post.data.titlePost)}</p>
          <p className={commonStyles.subTitle} >{RichText.asText(post.data.subTitle)}</p>
          <div className={commonStyles.dateAndAuthor}>
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

        <div className={styles.content}>
          {
            post && post?.data?.group?.map( ({ heading, body }, idx) => (
              <div key={idx}>
                <h1>{RichText.asText(heading)}</h1>

                <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }} />

              </div>
            ))
          }
        </div>
      </section>
    </main>
  )
}

export const getStaticPaths = async () => {
  // const prismic = getPrismicClient({});
  // const posts = await prismic.getByType(TODO);

  // // TODO

  return {
    paths: [], //-> Serve para indicar quais páginas serão geradas de forma estática durante o build
    fallback: 'blocking'
  }
};

export const getStaticProps = async ({ params: { slug } }) => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID("post", String(slug), {});
  
  return {
    props: {
      post: response
    }
  }
};
