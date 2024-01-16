import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/router"
import Head from "next/head"

import { getSectionTypeString } from "../libs/sectionType"
import { Header } from "../components/Header"
import { PageController } from "../components/PageController"
import { SpeakerPop } from "../components/SpeakerPop"

export default function SearchResult() {
  const router = useRouter()
  const [results, setResults] = useState([])
  const [totalResults, setTotalResults] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!router.isReady) {return}

    let unmounted = false

    async function fetchResult () {
      const page = Number(router.query.p || "1")
      // ページ数が自然数ではない場合
      if (!(Number.isInteger(page) && page > 0)) {
        throw new Error()
      }

      const searchAPIParams = {
        query: router.query.q.trim() || "",
        target: router.query.t || "content",
        splitQuery: router.query.l === "1",
        fetchItems: 20,
        fetchOffset: (page - 1) * 20
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchAPIParams),
        }
      )
      const data = await response.json()
      
      if (!unmounted) {
        const maxPage = data.totalItems > 0 ? Math.ceil(data.totalItems / 20) : 1
        // ページが最大値を超えている
        if (page > maxPage) {
          throw new Error()
        }
        setTotalResults(data.totalItems)
        setResults(data.items)
        setIsLoaded(true)
      }
    }

    fetchResult().catch((error) => {
      if (!unmounted) {
        setIsLoaded(true)
      }
    })

    return () => {unmounted = true}
  }, [router.isReady, router.query.l, router.query.p, router.query.q, router.query.t])

  return (
    <>
      <Head>
        <title>
          {router.isReady ? `発言検索結果: ${router.query.q}` : "発言検索結果"}
        </title>
      </Head>

      <Header router={router} />
      <main className="pt-20 px-4 max-w-2xl mx-auto">
        {isLoaded && results.length > 0 &&
          <>
            <div>&quot;{router.isReady ? router.query.q : ""}&quot; の検索結果 ({totalResults} 件)</div>
            <div>
              {results.map(({
                id,
                councilID,
                councilName,
                councilDate,
                type,
                role,
                speakerID,
                speakerName,
                speakerParty,
                snippetSentence
              }) => (
                <div
                  className="my-6 p-4 shadow-neu-sm rounded-xl"
                  key={id}
                >
                  <SpeakerPop
                    speakerID={speakerID}
                    className={`px-4 py-1 w-fit text-sm font-bold rounded-full
                                hover:brightness-105
                                ${type === 1 ? "bg-green-300" : ""}
                                ${type === 2 ? "bg-slate-300" : ""}
                                ${type === 3 ? "bg-blue-300" : ""}`}
                  >
                    {speakerID ? `${getSectionTypeString(type)}: ${speakerName} (${speakerParty || ""} ${role || ""})`
                    : "発言者情報なし"}
                  </SpeakerPop>
                  <div className="my-4 text-lg text-blue-800 hover:underline">
                    {councilID ?
                     <a href={`/councils/${councilID}?sectionid=${id}`}>
                       {councilName} ({councilDate})
                     </a>
                     :
                     "会議不明"
                    }
                  </div>
                  <div className="text-sm">{snippetSentence}</div>
                </div>
              ))}
            </div>
            <PageController
              router={router}
              maxPage={Math.ceil(totalResults / 20)}
            />
          </>
        }
        {isLoaded && results.length === 0 &&
          <>
            <h1 className="text-2xl font-bold">条件に一致する発言が見つかりませんでした</h1>
            <div>ほかの条件を試してみてください。</div>
          </>
        }
      </main>
    </>
  )
}
