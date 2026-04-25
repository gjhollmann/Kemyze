/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/components/NavBar`; params?: Router.UnknownInputParams; } | { pathname: `/Pages/inventory`; params?: Router.UnknownInputParams; } | { pathname: `/Pages/login`; params?: Router.UnknownInputParams; } | { pathname: `/Pages/profile`; params?: Router.UnknownInputParams; } | { pathname: `/Pages/scanner`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `/components/NavBar`; params?: Router.UnknownOutputParams; } | { pathname: `/Pages/inventory`; params?: Router.UnknownOutputParams; } | { pathname: `/Pages/login`; params?: Router.UnknownOutputParams; } | { pathname: `/Pages/profile`; params?: Router.UnknownOutputParams; } | { pathname: `/Pages/scanner`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `/components/NavBar${`?${string}` | `#${string}` | ''}` | `/Pages/inventory${`?${string}` | `#${string}` | ''}` | `/Pages/login${`?${string}` | `#${string}` | ''}` | `/Pages/profile${`?${string}` | `#${string}` | ''}` | `/Pages/scanner${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/components/NavBar`; params?: Router.UnknownInputParams; } | { pathname: `/Pages/inventory`; params?: Router.UnknownInputParams; } | { pathname: `/Pages/login`; params?: Router.UnknownInputParams; } | { pathname: `/Pages/profile`; params?: Router.UnknownInputParams; } | { pathname: `/Pages/scanner`; params?: Router.UnknownInputParams; };
    }
  }
}
