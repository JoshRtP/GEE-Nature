/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_GEE_OAUTH_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '@google/earthengine' {
  const ee: {
    initialize: (
      apiBaseUrl?: string | null,
      tileBaseUrl?: string | null,
      successCallback?: (() => void) | null,
      errorCallback?: ((err: unknown) => void) | null,
      xsrfToken?: string | null,
      project?: string | null,
    ) => void;
    reset: () => void;
    data: {
      authenticateViaOauth: (
        clientId: string,
        success: () => void,
        error?: ((err: unknown) => void) | null,
        extraScopes?: string[],
        onImmediateFailed?: (() => void) | null,
        suppressDefaultScopes?: boolean,
      ) => void;
      authenticateViaPopup: (
        success?: () => void,
        error?: (err: unknown) => void,
      ) => void;
      getAuthToken: () => string | null;
    };
    FeatureCollection: (assetId: string) => EEFeatureCollection;
    ImageCollection: (id: string) => EEImageCollection;
    Image: EEImageStatic;
    Reducer: {
      mean: () => EEReducer;
    };
    Filter: {
      lt: (property: string, value: number) => EEFilter;
    };
    Date: (value: number | string) => EEDate;
  };

  interface EEObject {
    evaluate: (callback: (result: unknown, error?: string) => void) => void;
    getInfo: (callback?: (result: unknown) => void) => unknown;
  }

  interface EEDate {
    advance: (delta: number, unit: string) => EEDate;
  }

  interface EEReducer {}
  interface EEFilter {}

  interface EEFeatureCollection extends EEObject {
    select: (properties: string[]) => EEFeatureCollection;
  }

  interface EEImageStatic {
    (id?: string): EEImage;
  }

  interface EEImage extends EEObject {
    select: (bands: string | string[]) => EEImage;
    addBands: (image: EEImage) => EEImage;
    subtract: (other: EEImage) => EEImage;
    divide: (other: EEImage) => EEImage;
    add: (other: EEImage) => EEImage;
    multiply: (value: number | EEImage) => EEImage;
    rename: (name: string) => EEImage;
    clip: (geometry: EEFeatureCollection) => EEImage;
    reduceRegions: (params: {
      collection: EEFeatureCollection;
      reducer: EEReducer;
      scale: number;
      crs?: string;
    }) => EEFeatureCollection;
    getMapId: (
      visParams: Record<string, unknown>,
      callback: (result: { mapid: string; token?: string } | null, error?: string) => void,
    ) => void;
  }

  interface EEImageCollection extends EEObject {
    filterBounds: (geometry: EEFeatureCollection) => EEImageCollection;
    filterDate: (start: EEDate, end: EEDate) => EEImageCollection;
    filter: (filter: EEFilter) => EEImageCollection;
    median: () => EEImage;
    first: () => EEImage;
    select: (bands: string[]) => EEImageCollection;
  }

  export = ee;
}
