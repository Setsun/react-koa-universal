import path from 'path';
import express from 'express';

import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { matchPath } from 'react-router-dom';

import { ServerStyleSheet } from 'styled-components';
import theme from '../style/theme';
import injectGlobalStyles from '../style/injectGlobalStyles';

import AppContainer from '../containers/AppContainer';
import AppProvider from '../providers/AppProvider';

import renderFullPage from '../utils/renderFullPage';

const env = process.env.NODE_ENV || 'test';
const port = process.env.PORT || 8800;

const app = new express();
const routes = ['/'];

app.use('/', express.static(path.join(__dirname, '/client')));
app.use('/', express.static(path.join(__dirname, '../public')));

app.get('*', (req, res) => {
  const match = routes.reduce(
    (acc, route) => matchPath(req.url, route, { exact: true }) || acc,
    false
  );

  if (!match) return;

  const sheet = new ServerStyleSheet();

  injectGlobalStyles();

  const html = renderToString(
    sheet.collectStyles(
      <AppProvider theme={theme} locale="en">
        <StaticRouter context={{}} location={req.url}>
          <AppContainer />
        </StaticRouter>
      </AppProvider>,
    )
  );

  const css = sheet.getStyleTags();

  res.send(renderFullPage(html, css));
});

app.listen(port, function() {
  console.log(`Started on env:${env} and http://localhost:${this.address().port}`);
});