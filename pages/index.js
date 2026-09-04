import { Client } from '@notionhq/client';
import Head from 'next/head';

export default function Home({ projects }) {
  return (
    <div style={{ backgroundColor: '#0e0e11', color: '#f4f4f5', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Head>
        <title>Keith Leung | Digital Portfolio & Audio Reviews</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* 導航列 */}
      <header style={{ borderBottom: '1px solid #27272a', padding: '1.25rem 2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: '800', letterSpacing: '0.1em', color: '#f59e0b', fontSize: '1.25rem' }}>KEITH LEUNG</div>
        <div style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>音響評測 ｜ 數碼企劃統籌</div>
      </header>

      {/* 英雄區 (Hero) */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem 2rem 2rem' }}>
        <p style={{ color: '#f59e0b', fontSize: '0.875rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem', fontFamily: 'monospace' }}>
          Portfolio & Digital Projects
        </p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1.2, margin: '0 0 1.5rem 0' }}>
          將頂級聽覺享受，<br />轉化為精準的視覺與數碼呈現。
        </h1>
        <p style={{ color: '#a1a1aa', maxWidth: '650px', fontSize: '1.1rem', lineHeight: 1.6, margin: 0 }}>
          逾百篇高階音響深度技術評測、展覽數碼指南與跨平台宣傳統籌。
        </p>
      </section>

      {/* 專案櫥窗 (Notion CMS 即時渲染) */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 2rem 4rem 2rem' }}>
        <div style={{ borderBottom: '1px solid #27272a', paddingBottom: '1rem', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>精選專案櫥窗</h2>
          <p style={{ color: '#71717a', fontSize: '0.875rem', marginTop: '0.25rem' }}>同步自 Notion Database 即時數據</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {projects.map((project) => (
            <div key={project.id} style={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* 封面圖 */}
                <div style={{ width: '100%', height: '200px', backgroundColor: '#27272a', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {project.cover ? (
                    <img src={project.cover} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#52525b', fontSize: '0.875rem', fontFamily: 'monospace' }}>NO COVER IMAGE</span>
                  )}
                </div>

                {/* 標籤與內文 */}
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {project.tags.map((t, idx) => (
                      <span key={idx} style={{ fontSize: '0.75rem', backgroundColor: '#27272a', color: '#e4e4e7', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0 0 0.5rem 0', color: '#fff' }}>{project.title}</h3>
                  {project.publisher && (
                    <p style={{ fontSize: '0.8rem', color: '#71717a', margin: 0, fontFamily: 'monospace' }}>出處：{project.publisher}</p>
                  )}
                </div>
              </div>

              {/* 引流按鈕 */}
              <div style={{ padding: '1.5rem', paddingTop: 0 }}>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'block', textAlign: 'center', backgroundColor: '#27272a', color: '#fff', padding: '0.75rem 1rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}
                >
                  閱讀官方原文 ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 頁尾 */}
      <footer style={{ borderTop: '1px solid #18181b', padding: '2rem', textAlign: 'center', fontSize: '0.8rem', color: '#52525b' }}>
        © {new Date().getFullYear()} Keith Leung. Built with Next.js & Notion CMS.
      </footer>
    </div>
  );
}

export async function getServerSideProps() {
  const notion = new Client({ auth: process.env.NOTION_API_KEY });

  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
    });

    const projects = response.results.map((page) => {
      const props = page.properties;
      let cover = '';
      if (props.Cover?.files?.length > 0) {
        cover = props.Cover.files[0].file?.url || props.Cover.files[0].external?.url || '';
      }

      return {
        id: page.id,
        title: props.Name?.title[0]?.plain_text || '未命名專案',
        tags: props.Tags?.multi_select?.map((t) => t.name) || [],
        publisher: props.Publisher?.rich_text[0]?.plain_text || '',
        link: props.Link?.url || '#',
        cover: cover,
      };
    });

    return { props: { projects } };
  } catch (err) {
    console.error(err);
    return { props: { projects: [] } };
  }
}
