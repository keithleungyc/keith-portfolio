import { Client } from '@notionhq/client';
import Head from 'next/head';

export default function Home({ projects, error }) {
  return (
    <div style={{ backgroundColor: '#0e0e11', color: '#f4f4f5', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Head>
        <title>Keith Leung | Digital Portfolio & Audio Reviews</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <header style={{ borderBottom: '1px solid #27272a', padding: '1.25rem 2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: '800', letterSpacing: '0.1em', color: '#f59e0b', fontSize: '1.25rem' }}>KEITH LEUNG</div>
        <div style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>音響評測 ｜ 數碼企劃統籌</div>
      </header>

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

      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 2rem 4rem 2rem' }}>
        <div style={{ borderBottom: '1px solid #27272a', paddingBottom: '1rem', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>精選專案櫥窗</h2>
          <p style={{ color: '#71717a', fontSize: '0.875rem', marginTop: '0.25rem' }}>同步自 Notion Database 即時數據</p>
        </div>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#3f1515', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5', marginBottom: '2rem', fontSize: '0.85rem' }}>
            連線診斷訊息：{error}
          </div>
        )}

        {projects && projects.length === 0 && !error && (
          <p style={{ color: '#71717a', fontStyle: 'italic' }}>目前資料庫未讀取到任何專案卡片，請檢查資料庫是否有內容。</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {projects && projects.map((project) => (
            <div key={project.id} style={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '100%', height: '200px', backgroundColor: '#27272a', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {project.cover ? (
                    <img src={project.cover} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#52525b', fontSize: '0.875rem', fontFamily: 'monospace' }}>NO COVER IMAGE</span>
                  )}
                </div>

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

      <footer style={{ borderTop: '1px solid #18181b', padding: '2rem', textAlign: 'center', fontSize: '0.8rem', color: '#52525b' }}>
        © {new Date().getFullYear()} Keith Leung. Built with Next.js & Notion CMS.
      </footer>
    </div>
  );
}

export async function getServerSideProps() {
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!apiKey || !databaseId) {
    return {
      props: {
        projects: [],
        error: `環境變數缺失: NOTION_API_KEY=${apiKey ? 'OK' : 'MISSING'}, NOTION_DATABASE_ID=${databaseId ? 'OK' : 'MISSING'}`
      }
    };
  }

  const notion = new Client({ auth: apiKey });

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
    });

    const projects = response.results.map((page) => {
      const props = page.properties;

      // 提取標題
      const title = props['名稱']?.title?.[0]?.plain_text || props.Name?.title?.[0]?.plain_text || '未命名專案';

      // 提取標籤
      const rawTags = props.Tags?.multi_select || props['標籤']?.multi_select || [];
      const tags = rawTags.map((t) => t.name);

      // 提取出處（兼顧 multi_select, select, rich_text）
      let publisher = '';
      if (props.Publisher?.multi_select) {
        publisher = props.Publisher.multi_select.map(p => p.name).join(' / ');
      } else if (props.Publisher?.select) {
        publisher = props.Publisher.select.name;
      } else if (props.Publisher?.rich_text) {
        publisher = props.Publisher.rich_text.map(t => t.plain_text).join('');
      }

      // 提取連結（兼顧 url 與 rich_text）
      let link = '#';
      if (props.Link?.url) {
        link = props.Link.url;
      } else if (props.Link?.rich_text?.[0]?.plain_text) {
        link = props.Link.rich_text[0].plain_text;
      }
      if (link !== '#' && !link.startsWith('http://') && !link.startsWith('https://')) {
        link = `https://${link}`;
      }

      // 提取封面圖片
      let cover = '';
      const coverProp = props.Cover || props['封面'];
      if (coverProp?.files?.length > 0) {
        cover = coverProp.files[0].file?.url || coverProp.files[0].external?.url || '';
      }

      return {
        id: page.id,
        title,
        tags,
        publisher,
        link,
        cover,
      };
    });

    return { props: { projects, error: null } };
  } catch (err) {
    return {
      props: {
        projects: [],
        error: `Notion 連線錯誤: ${err.message || err.toString()}`
      }
    };
  }
}
