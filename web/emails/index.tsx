import {
   Button,
   CodeInline,
   Column,
   Container, Font,
   Head, Heading,
   Hr,
   Html, Img,
   Row,
   Section,
   Tailwind,
   Text,
   Link,
   Preview,
} from "@react-email/components";
import { CodeBlock, dracula } from "@react-email/code-block";
import * as React from "react";

export default function Email() {
   return (
      <Html dir={`ltr`} lang="en">
         <Head>
            <title>My email title</title>
            <Font fontStyle={`normal`} fontWeight={400} fontFamily={`Inter`} fallbackFontFamily={`Verdana`} />
         </Head>
         <Tailwind config={{
            theme: {
               extend: {
                  colors: { brand: `#007291` },
               },
            },
         }}>
            <Container className={`text-xs`}>
               <Button
                  href="https://example.com"
                  className={`bg-brand px-3 py-2 font-medium leading-4 text-white rounded-md shadow-md`}
                  style={{ background: "#000", color: "#fff", padding: "12px 20px" }}
               >
                  Click me
               </Button>
               <Text className={`text-xl`}>Some text</Text>
               <CodeBlock lineNumbers theme={dracula} language={`js`} code={`const x = Math.pow(2, 3);`} />
               <CodeInline className={`mt-4`}>@react-email/code-inline</CodeInline>
            </Container>
            <Hr className={`w-1/2`} />
            <Heading as={`h2`}>This is a heading</Heading>
            <Text className={`text-xl`}>Some text</Text>
            <Section className={`w-full`}>
               <Row className={`justify-between flex w-full items-start`}>
                  <Column>
                     A
                     <Img className={`rounded-lg shadow-md`} width={200}
                          src={`https://images.pexels.com/photos/16039120/pexels-photo-16039120/free-photo-of-sunlit-rocks-on-sea-shore.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1`} />
                  </Column>
                  <Column>
                     <Text>
                        B
                     </Text>
                     <Link href={`https://www.example.com`}>To example.com</Link>
                  </Column>
                  <Column>
                     <Text>
                        C
                     </Text>
                     <Preview className={`text-md`}>Some preview text</Preview>
                  </Column>
               </Row>
            </Section>
         </Tailwind>
      </Html>
   );
}
