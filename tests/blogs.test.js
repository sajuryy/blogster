const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('localhost:3000');
});

afterEach(async () => {
    await page.close();
});

describe('When logged in', () => {
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });

    test('When loged in, can see blog create form', async () => {
        const label = await page.getContentsOf('form label');
        expect(label).toEqual('Blog Title');
    });

    describe('When using valid inputs', async () => {
        beforeEach(async () => {
            await page.type('.title input', 'My Title');
            await page.type('.content input', 'My Content');
            await page.click('form button');

        });

        test('Submitting takes user to review screen', async () => {
            const text = await page.getContentsOf('h5');

            expect(text).toEqual('Please confirm your entries')

        });

        test('Submitting then saving adds blog to index page', async () => {
            await page.click('button.green');
            await page.waitFor('.card');
            const title = await page.getContentsOf('.card-title');
            const conent = await page.getContentsOf('p');

            expect(title).toEqual('My Title');
            expect(conent).toEqual('My Content');

        });

    });

    describe('When using invalid inputs', async () => {

        beforeEach(async () => {
            await page.click('form button');
        });

        test(' the form shows an erred message', async () => {
            const title = await page.getContentsOf('.title .red-text');
            const content = await page.getContentsOf('.content .red-text');

            expect(title).toEqual('You must provide a value');
            expect(content).toEqual('You must provide a value');

        });
    });
});

describe('When user is NOT logged in ', async () => {
    const actions = [
        {
            method: 'get',
            path: '/api/blogs'
        },
        {
            method: 'post',
            path: '/api/blogs',
            data: {
                title: 'T',
                content: 'C'
            }
        }
    ];

    test('Blog ralated actions are prohibited', async () => {
        const results = await page.execRequest(actions);

        for (let result of results) {
            expect(result).toEqual({ error: 'You must log in!' });
        }

    });
});