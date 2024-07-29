import * as core from '@actions/core';
import * as main from './main';

(async (): Promise<void> => {
  try {
    await main.run();
  } catch (error) {
    core.setFailed(
      error instanceof Error
        ? `Action failed with "${error.message}"`
        : 'Unexpected error'
    );
  }
})();
