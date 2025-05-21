/* eslint-disable style/operator-linebreak */
import type { ErrorHandler } from 'hono';

import { HTTPException } from 'hono/http-exception';
import { INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes';

const onError: ErrorHandler = (err, c) => {
  if (err instanceof HTTPException) {
    const errResponse =
      err.res ??
      c.json(
        {
          success: false,
          error: err.message,
          isFormError:
            err.cause && typeof err.cause === 'object' && 'json' in err.cause ? err.cause.json === true : false,
        },
        err.status,
      );

    return errResponse;
  }

  return c.json(
    {
      success: false,
      // eslint-disable-next-line node/no-process-env
      error: process.env.NODE_ENV === 'production' ? 'Interal Server Error' : err.stack ?? err.message,
    },
    INTERNAL_SERVER_ERROR,
  );
};

export default onError;
