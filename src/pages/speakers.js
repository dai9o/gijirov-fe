import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"

import { Header } from "../components/Header"
import { PageController } from "../components/PageController"

export default function SpeakerList() {
  const router = useRouter()
  const [totalSpeakers, setTotalSpeakers] = useState()
  const [speakers, setSpeakers] = useState()
  const [isLoaded, setIsLoaded] = useState()

  useEffect(() => {
    if (!router.isReady) {return}

    let unmounted = false

    async function fetchResult () {
      const page = Number(router.query.p || "1")
      // ページ数が自然数ではない場合
      if (!(Number.isInteger(page) && page > 0)) {
        throw new Error()
      }

      const apiParams = {
        fetchItems: 20,
        fetchOffset: (page - 1) * 20
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/speakers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiParams),
        }
      )
      const data = await response.json()

      if (!unmounted) {
        const maxPage = data.totalItems > 0 ? Math.ceil(data.totalItems / 20) : 1
        // ページが最大値を超えている
        if (page > maxPage) {
          throw new Error()
        }
        setTotalSpeakers(data.totalItems)
        setSpeakers(data.items)
        setIsLoaded(true)
      }
    }

    fetchResult().catch((error) => {
      if (!unmounted) {
        setIsLoaded(true)
      }
    })

    return () => {unmounted = true}
  }, [router.isReady, router.query.p])

  return (
    <>
      <Head>
        <title>発言者一覧</title>
      </Head>

      <Header />
      <main className="pt-20 px-4 max-w-2xl mx-auto">
        <h1 className="font-black text-4xl mb-4">発言者一覧</h1>
        {isLoaded && speakers &&
          <>
            <div className="mb-8">
              計 {totalSpeakers} 人
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {speakers.map((speaker) => (
                <div key={speaker.id} className="p-4 rounded-xl shadow-neu-sm">
                  <div>
                    <a
                      href={`speakers/${speaker.id}`}
                      className="font-bold text-xl text-blue-800 hover:underline"
                    >
                      {speaker.name}
                    </a>
                  </div>
                  <div>{speaker.party || ""}</div>
                </div>
              ))}
            </div>
            <PageController
              router={router}
              maxPage={Math.ceil(totalSpeakers / 20)}
            />
          </>
        }
        {isLoaded && !speakers &&
          <>
            <h2 className="text-2xl font-bold">発言者一覧を取得できませんでした</h2>
            <div>DB サーバーが停止している可能性があります。</div>
          </>
        }
      </main>
    </>
  )
}