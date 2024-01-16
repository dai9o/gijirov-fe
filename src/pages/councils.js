import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"

import { Header } from "../components/Header"
import { PageController } from "../components/PageController"

export default function CouncilList() {
  const router = useRouter()
  const [totalCouncils, setTotalCouncils] = useState()
  const [councils, setCouncils] = useState()
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
        `${process.env.NEXT_PUBLIC_API_URL}/councils`,
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
        setTotalCouncils(data.totalItems)
        setCouncils(data.items)
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
        <title>会議一覧</title>
      </Head>
    
      <Header />
      <main className="pt-20 px-4 max-w-2xl mx-auto">
        <h1 className="font-black text-4xl mb-4">会議一覧</h1>
        {isLoaded && councils &&
          <>
            <div className="mb-8">
              計 {totalCouncils} 件
            </div>
            {councils.map((council) => (
              <div key={council.id} className="my-6">
                <div>
                  <a
                    href={`councils/${council.id}`}
                    className="font-bold text-xl text-blue-800 hover:underline"
                  >
                    {council.name}
                  </a>
                </div>
                <div>開催日：{council.heldOn}</div>
              </div>
            ))}
            <PageController
              router={router}
              maxPage={Math.ceil(totalCouncils / 20)}
            />
          </>
        }
        {isLoaded && !councils &&
          <>
            <h2 className="text-2xl font-bold">会議一覧を取得できませんでした</h2>
            <div>DB サーバーが停止している可能性があります。</div>
          </>
        }
      </main>
    </>
  )
}