import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import {
  Page,
  Grid,
  LegacyCard,
  Frame
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
///////////////////////////////////////////////////////////////////////////////////
import { useState } from "react";
import stylesheetQuill from "react-quill/dist/quill.snow.css";
import { ClientOnly } from "remix-utils/client-only";
import { Form } from "@remix-run/react";
import { FallbackComponent } from "~/components/fallback-component";
import { TextEditor } from "~/components/textEditor.client";


export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheetQuill },
];


//////////////////////////////////////////////////////////////////



export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        input: {
          title: `${color} Snowboard`,
          variants: [{ price: Math.random() * 100 }],
        },
      },
    }
  );
  const responseJson = await response.json();

  return json({
    product: responseJson.data.productCreate.product,
  });
};

export default function Index() {
  const [textEditor, setTextEditor] = useState("");
  return (
    <Page>
      <Grid>
        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
          <Frame>
            <LegacyCard title="Description" sectioned>
              <Form method="post">
                <ClientOnly fallback={<FallbackComponent />}>
                  {() => (
                    <TextEditor
                      theme="snow"
                      placeholder="Write description"
                      onChange={setTextEditor}
                      value={textEditor}
                    />
                  )}
                </ClientOnly>
                <input type="hidden" name="textEditor" value={textEditor} />
                <br />
                <button type="submit">Submit</button>
              </Form>
            </LegacyCard>
          </Frame>
        </Grid.Cell>
      </Grid>
    </Page>
  );
}
