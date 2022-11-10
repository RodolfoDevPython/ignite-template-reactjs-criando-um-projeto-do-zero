
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GetStaticPropsContext } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { RouterContext } from 'next/dist/shared/lib/router-context';

import { getPrismicClient } from '../../services/prismic';
import App, { getStaticProps } from '../../pages';

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

interface GetStaticPropsResult {
  props: HomeProps;
}

const mockedGetByTypeReturn = {
  next_page: 'link',
  results: [
    {
      uid: 'como-utilizar-hooks',
      first_publication_date: '2021-03-15T19:25:28+0000',
      data: {
        titlePost: 'Como utilizar Hooks',
        subTitle: 'Pensando em sincronização em vez de ciclos de vida',
        nameAuthor: 'Joseph Oliveira',
      },
    },
    {
      uid: 'criando-um-app-cra-do-zero',
      first_publication_date: '2021-03-25T19:27:35+0000',
      data: {
        titlePost: 'Criando um app CRA do zero',
        subTitle:
          'Tudo sobre como criar a sua primeira aplicação utilizando Create React App',
          nameAuthor: 'Danilo Vieira',
      },
    },
  ],
};

jest.mock('@prismicio/client');
jest.mock('../../services/prismic');
jest.mock('prismic-dom')

const mockedPrismic = getPrismicClient as jest.Mock;
const mockedFetch = jest.spyOn(window, 'fetch') as jest.Mock;
const mockedPush = jest.fn();
let RouterWrapper;

describe('Home', () => {
  beforeAll(() => {
    mockedPush.mockImplementation(() => Promise.resolve());
    const MockedRouterContext = RouterContext as React.Context<unknown>;
    RouterWrapper = ({ children }): JSX.Element => {
      return (
        <MockedRouterContext.Provider
          value={{
            push: mockedPush,
          }}
        >
          {children}
        </MockedRouterContext.Provider>
      );
    };

    mockedPrismic.mockReturnValue({
      getByType: () => {
        return Promise.resolve(mockedGetByTypeReturn);
      },
    });

    mockedFetch.mockImplementation(() => {
      return Promise.resolve({
        json: () =>
          Promise.resolve({
            next_page: null,
            results: [
              {
                uid: 'criando-um-app-cra-do-zero',
                first_publication_date: '2021-03-25T19:27:35+0000',
                data: {
                  titlePost: 'Criando um app CRA do zero',
                  subTitle:
                    'Tudo sobre como criar a sua primeira aplicação utilizando Create React App',
                    nameAuthor: 'Danilo Vieira',
                },
              },
            ],
          }),
      });
    });
  });

  it('should be able to return prismic posts documents using getStaticProps', async () => {
    const postsPaginationReturn = mockedGetByTypeReturn;

    const getStaticPropsContext: GetStaticPropsContext<ParsedUrlQuery> = {};

    const response = (await getStaticProps(
      getStaticPropsContext
    )) as GetStaticPropsResult;

    expect(response.props.postsPagination.next_page).toEqual(
      postsPaginationReturn.next_page
    );
    expect(response.props.postsPagination.results).toEqual(
      expect.arrayContaining([
        expect.objectContaining(postsPaginationReturn.results[0]),
        expect.objectContaining(postsPaginationReturn.results[1]),
      ])
    );
  });

  it('should be able to render posts documents info', () => {
    const postsPagination = mockedGetByTypeReturn;

    render(<App postsPagination={postsPagination} />);

    screen.findByText('Como utilizar Hooks');
    screen.findByText('Pensando em sincronização em vez de ciclos de vida');
    screen.findByText('15 mar 2021');
    screen.findByText('Joseph Oliveira');

    screen.findByText('Criando um app CRA do zero');
    screen.findByText(
      'Tudo sobre como criar a sua primeira aplicação utilizando Create React App'
    );
    screen.findByText('15 mar 2021');
    screen.findByText('Danilo Vieira');
  });

  it('should be able to navigate to post page after a click', async () => {
    const postsPagination = mockedGetByTypeReturn;

    render(<App postsPagination={postsPagination} />, {
      wrapper: RouterWrapper,
    });

    const firstPostTitle = await screen.findByText('Como utilizar Hooks');
    const secondPostTitle = await screen.findByText('Criando um app CRA do zero');

    fireEvent.click(firstPostTitle);
    fireEvent.click(secondPostTitle);

    expect(mockedPush).toHaveBeenNthCalledWith(
      1,
      '/post/como-utilizar-hooks',
      {"forceOptimisticNavigation": true}
    );
    expect(mockedPush).toHaveBeenNthCalledWith(
      2,
      '/post/criando-um-app-cra-do-zero',
      {"forceOptimisticNavigation": true}
    );
  });

  // it('should be able to load more posts if available', async () => {
  //   const postsPagination = { ...mockedGetByTypeReturn };
  //   postsPagination.results = [
  //     {
  //       uid: 'como-utilizar-hooks',
  //       first_publication_date: '2021-03-15T19:25:28+0000',
  //       data: {
  //         titlePost: 'Como utilizar Hooks',
  //         subTitle: 'Pensando em sincronização em vez de ciclos de vida',
  //         nameAuthor: 'Joseph Oliveira',
  //       },
  //     },
  //   ];

  //   render(<App postsPagination={postsPagination} />);

  //   screen.findByText('Como utilizar Hooks');
  //   const loadMorePostsButton = screen.getByText('Carregar mais posts');

  //   fireEvent.click(loadMorePostsButton);

  //   await waitFor(
  //     () => {
  //       expect(mockedFetch).toHaveBeenCalled();
  //     },
  //     { timeout: 200 }
  //   );

  //   screen.getByText('Criando um app CRA do zero');
  // });

  // it('should not be able to load more posts if not available', async () => {
  //   const postsPagination = mockedGetByTypeReturn;
  //   postsPagination.next_page = null;

  //   render(<App postsPagination={postsPagination} />);

  //   screen.getByText('Como utilizar Hooks');
  //   screen.getByText('Criando um app CRA do zero');
  //   const loadMorePostsButton = screen.queryByText('Carregar mais posts');

  //   expect(loadMorePostsButton).not.toBeInTheDocument();
  // });
});