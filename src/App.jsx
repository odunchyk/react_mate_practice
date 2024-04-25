/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import cn from 'classnames';
import './App.scss';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const TABLE_HEAD = ['ID', 'Product', 'Category', 'User'];

const products = productsFromServer.map(product => {
  const category = categoriesFromServer.find(c => product.categoryId === c.id);
  const user = usersFromServer.find(u => category.ownerId === u.id);

  return {
    ...product,
    category,
    user,
  };
});

function prepareProducts(
  givenProducts,
  owner,
  query,
  categories,
  sortField,
  sortingOrder,
) {
  let preparedProducts = [...givenProducts];

  if (owner !== 'All') {
    preparedProducts = preparedProducts.filter(
      product => product.category.ownerId === owner.id,
    );
  }

  if (query) {
    preparedProducts = preparedProducts.filter(product => {
      const normalizedProductName = product.name.trim().toLowerCase();
      const normalizedQuery = query.trim().toLowerCase();

      return normalizedProductName.includes(normalizedQuery);
    });
  }

  if (categories.length !== 0) {
    preparedProducts = preparedProducts.filter(product =>
      categories.some(category => category.id === product.categoryId),
    );
  }

  switch (sortField) {
    case 'ID':
      return preparedProducts.sort((a, b) => {
        const result = a.id - b.id;

        return sortingOrder === 'asc' ? result : -result;
      });
    case 'Product':
      return preparedProducts.sort((a, b) => {
        const result = a.name.localeCompare(b.name);

        return sortingOrder === 'asc' ? result : -result;
      });
    case 'Category':
      return preparedProducts.sort((a, b) => {
        const result = a.category.title.localeCompare(b.category.title);

        return sortingOrder === 'asc' ? result : -result;
      });
    case 'User':
      return preparedProducts.sort((a, b) => {
        const result = a.user.name.localeCompare(b.user.name);

        return sortingOrder === 'asc' ? result : -result;
      });

    default:
      return preparedProducts;
  }
}

export const App = () => {
  const [activeUser, setActiveUser] = useState('All');
  const [query, setQuery] = useState('');
  const [activeCategories, setActiveCategories] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortingOrder, setSortingOrder] = useState('asc');

  const preparedProducts = prepareProducts(
    products,
    activeUser,
    query,
    activeCategories,
    sortField,
    sortingOrder,
  );

  function handleCategoryClick(category) {
    if (!activeCategories.includes(category)) {
      return setActiveCategories([...activeCategories, category]);
    }

    const withoutRemovedCategory = activeCategories.toSpliced(
      activeCategories.findIndex(activeCategory => activeCategory === category),
      1,
    );

    return setActiveCategories(withoutRemovedCategory);
  }

  function handleSortClick(columnName) {
    if (sortField === columnName) {
      if (sortingOrder === 'asc') {
        setSortingOrder('desc');
      } else if (sortingOrder === 'desc') {
        setSortField(null);
        setSortingOrder(null);
      }
    } else {
      setSortField(columnName);
      setSortingOrder('asc');
    }
  }

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={activeUser === 'All' && 'is-active'}
                onClick={() => setActiveUser('All')}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  data-cy="FilterUser"
                  href="#/"
                  key={user.id}
                  className={activeUser.name === user.name && 'is-active'}
                  onClick={() => setActiveUser(user)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                <span className="icon is-right">
                  {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                  {query !== '' && (
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  )}
                </span>
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button', 'is-success', 'mr-6', {
                  'is-outlined': activeCategories.length !== 0,
                })}
                onClick={() => setActiveCategories([])}
              >
                All
              </a>

              {categoriesFromServer.map(category => {
                return (
                  <a
                    key={category.id}
                    data-cy="Category"
                    className={cn('button', 'mr-2', 'my-1', {
                      'is-info': activeCategories.includes(category),
                    })}
                    href="#/"
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category.title}
                  </a>
                );
              })}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={() => {
                  setActiveUser('All');
                  setQuery('');
                  setActiveCategories('');
                }}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {preparedProducts.length === 0 && (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          )}

          <table
            data-cy="ProductTable"
            className="table is-striped is-narrow is-fullwidth"
          >
            {preparedProducts.length !== 0 && (
              <thead>
                <tr>
                  {TABLE_HEAD.map(columnName => (
                    <th key={columnName}>
                      <span className="is-flex is-flex-wrap-nowrap">
                        {columnName}
                        <a href="#/">
                          <span className="icon">
                            <i
                              data-cy="SortIcon"
                              className={cn('fas', {
                                'fa-sort': sortField !== columnName,
                                'fa-sort-up':
                                  sortField === columnName &&
                                  sortingOrder === 'asc',
                                'fa-sort-down':
                                  sortField === columnName &&
                                  sortingOrder === 'desc',
                              })}
                              onClick={() => handleSortClick(columnName)}
                            />
                          </span>
                        </a>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
            )}

            <tbody>
              {preparedProducts.map(product => {
                return (
                  <tr data-cy="Product" key={product.id}>
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">{`${product.category.icon} - ${product.category.title}`}</td>

                    <td
                      data-cy="ProductUser"
                      className={cn({
                        'has-text-link': product.user.sex === 'm',
                        'has-text-danger': product.user.sex === 'f',
                      })}
                    >
                      {product.user.name}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
