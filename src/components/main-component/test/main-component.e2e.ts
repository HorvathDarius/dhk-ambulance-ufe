import { newE2EPage } from '@stencil/core/testing';

describe('main-component', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<main-component></main-component>');

    const element = await page.find('main-component');
    expect(element).toHaveClass('hydrated');
  });
});
