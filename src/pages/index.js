import { useRef, useState, useEffect } from "react"
import Head from "next/head"

import { sleep } from "../libs/sleep"
import { useDeactivation } from "../libs/useDeactivation"
import { Header } from "../components/Header"

function MessageUnit({
  myMessage,
  replyMessage,
  model,
  replyExistsInCorpus,
  replyRef=undefined,
  replyIsTyping=false,
  replyIsBlinking=false,
  isFailed=false,
}) {
  return (<>
    <div className="flex justify-end">
      <div className="max-w-[80%]">
        <div className="my-1 text-sm text-slate-500">あなた</div>
        <div className="bg-gradient-to-br from-green-300 p-4 rounded-xl shadow-neu-sm to-green-400">
          {myMessage}
        </div>
      </div>
    </div>

    <div className="items-start flex my-6">
      <div className="max-w-[80%]">
        <div className="my-1 text-sm text-blue-500">
          {model === "giin" ? "議員" : "行政"}
        </div>

        <div
          className={isFailed ? "text-slate-500" : "bg-gradient-to-br p-4 rounded-xl shadow-neu-sm bg-white"}
        >
          <div
            className={`${isFailed ? "" : "text-xl font-bold"}
                        ${replyIsTyping ? "typing": ""}
                        ${replyIsBlinking ? "blinking": ""}`}
            ref={replyRef}
          >
            {replyMessage}
          </div>
          {replyExistsInCorpus && !replyIsTyping && !replyIsBlinking &&
           <div className="mt-2 text-sm opacity-80">
               <div>会議録に既存の文章です。</div>
           </div>
          }
        </div>
      </div>
    </div>
  </>)
}

function ModelPill({ model, src, onClick, isOn }) {
  return (
    <button
      type="button"
      className="rounded-full shadow-neu-sm"
      onClick={onClick}
    >
      <div
        className={
          `flex items-center m-1 rounded-full border border-blue-400
           ${isOn ? "bg-gradient-to-b from-blue-500 to-blue-400 border-transparent text-white"
                  : "bg-transparent brightness-90 hover:brightness-100 text-blue-400"}`
        }
      >
        <div className="px-4">
          {model === "giin" ? "議員" : "行政"}
        </div>
      </div>
    </button>
  )
}

export default function Home() {

  const [replies, setReplies] = useState([])
  const [currentReply, setCurrentReply] = useState()
  const [replyIsTyping, setReplyIsTyping] = useState(false)
  const [replyIsBlinking, setReplyIsBlinking] = useState(false)

  const [modelIsGiin, setModelIsGiin] = useState(true)

  const promptRef= useRef()
  const currentReplyRef = useRef()
  const searchTooltipRef = useRef()

  const [searchTooltipIsActive, setSearchTooltipIsActive] = useDeactivation(searchTooltipRef)

  function handleSelectSentence(event) {
    const selection = window.getSelection().toString()
    if (selection.length === 0) {return}

    searchTooltipRef.current.style.left = `${event.pageX}px`
    searchTooltipRef.current.style.top = `${event.pageY}px`
    searchTooltipRef.current.href = `/search?q=${encodeURIComponent(selection)}&t=parsedSentences`
    setSearchTooltipIsActive(true)
  }

  function goToPageBottom() {
    const root = document.documentElement
    window.scroll({
      top: root.scrollHeight - root.clientHeight,
      behavior: "smooth"
    })
  }

  function handleGenerate() {
    if (replyIsTyping || replyIsBlinking) {return}

    const prompt = promptRef.current.value.trim()
    if (prompt === "") {
      window.alert("キーワードを入力してください。")
      return
    }
  
    const model = modelIsGiin ? "giin" : "gyosei"

    if (currentReply) {
      setReplies(replies.concat([currentReply]))
      currentReplyRef.current.textContent = ""
    }
    const newReply = {
      model,
      prompt,
      sentence: "",
      isFailed: false,
      existsInCorpus: false,
    }
    console.log(newReply)
    setCurrentReply(newReply)

    setReplyIsTyping(true)
    setReplyIsBlinking(true)

    async function fetchSentence() {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            prompt,
            wakachi: true
          }),
        }
      )

      const data = await response.json()
      return data
    }

    fetchSentence().then(({
      sentence,
      existsInCorpus
    }) => {
      goToPageBottom()
      setReplyIsBlinking(false)
      setCurrentReply({
        ...newReply,
        sentence,
        existsInCorpus
      })
      const chars = sentence.split("")
      chars.forEach((char, i) => {
        setTimeout(() => {
          currentReplyRef.current.textContent += char
        }, 30 * i)
      })
      return sleep(30 * chars.length)
    }).then(() => {
      setReplyIsTyping(false)
    }).catch((error) => {
      const errorMessage = "発言をシミュレートできませんでした。ほかのキーワードを試してみてください。"
      goToPageBottom()
      setReplyIsTyping(false)
      setReplyIsBlinking(false)
      setCurrentReply({
        ...newReply,
        sentence: errorMessage,
        isFailed: true
      })
      currentReplyRef.current.textContent = errorMessage
    })
  }


  return (
    <>
      <Head>
        <title>刈谷市議会 議員発言・行政答弁シミュレーター</title>
      </Head>

      <Header />
      <main className="pt-20 max-w-2xl mx-auto">

        <a
          className="absolute backdrop-blur bg-slate-100/80 border
                     border-slate-200 p-2 rounded-xl shadow-lg hover:brightness-105"
          hidden={!searchTooltipIsActive}
          ref={searchTooltipRef}
        >
          検索
        </a>

        <div className="mb-72 px-4" onMouseUp={handleSelectSentence}>

          <div className="my-10 text-center">
            <h1 className="text-2xl font-bold text-blue-800">
              刈谷市の議員発言・行政答弁をシミュレートします
            </h1>
            <div className="mt-2 text-slate-900">
              まずは下の入力ボックスになにかキーワードを入力し、送信してみましょう。
            </div>
            <div className="mt-2 text-slate-500">
              発言は会議録をもとにシミュレートされており、内容の正確性を保証するものではありません。
              <br/>
              データセット: 刈谷市議会 本会議会議録 2019 年 9 月 〜 2023 年 3 月
            </div>
          </div>
          <div className="border border-slate-900 my-10 p-4 rounded-xl text-slate-900">
            <h2 className="text-xl">より自然な応答を得るためのキーワード指定のヒント</h2>
            <ul className="mt-2 list-disc list-inside">
              <li>最初に鍵括弧 (文頭マーカー) を入力する (&quot;事業&quot; → &quot;「事業&quot;)</li>
              <li>より具体的な単語を指定する (&quot;教育&quot; → &quot;情報モラル教育&quot;)</li>
              <li>1 つではなく複数の単語を指定する (&quot;ai&quot; → &quot;ai を活用&quot;)</li>
            </ul>
            <div className="mt-2">
              会議録に存在しないキーワードからは、発言をシミュレートすることはできません。
            </div>
          </div>

          {replies.map((reply, i) => (
            <MessageUnit
              key={i}
              myMessage={reply.prompt}
              replyMessage={reply.sentence}
              model={reply.model}
              replyExistsInCorpus={reply.existsInCorpus}
              isFailed={reply.isFailed}
            />
          ))}

          {currentReply &&
            <MessageUnit
              myMessage={currentReply.prompt}
              replyMessage=""
              model={currentReply.model}
              replyExistsInCorpus={currentReply.existsInCorpus}
              replyRef={currentReplyRef}
              replyIsTyping={replyIsTyping}
              replyIsBlinking={replyIsBlinking}
              isFailed={currentReply.isFailed}
            />
          }

        </div>

        <div
          className="fixed backdrop-blur bg-slate-50/90 border
                     border-slate-200 bottom-0 px-4 py-2 max-w-2xl rounded-t-2xl
                     shadow-2xl w-full"
        >
          <div className="flex items-center">
            <div
              className="flex gap-4 my-2 grow"
            >
              <ModelPill
                onClick={() => {setModelIsGiin(true)}}
                isOn={modelIsGiin}
                model="giin"
              />
              <ModelPill
                onClick={() => {setModelIsGiin(false)}}
                isOn={!modelIsGiin}
                model="gyosei"
              />
            </div>

          </div>

          <div className="flex gap-4 my-2 items-center">
            <input
              type="text"
              placeholder="開始キーワード"
              className="w-full shadow-neu-pressed-sm rounded-full h-8 p-2 bg-transparent border border-blue-400"
              ref={promptRef}
              onKeyDown={(event) => {
                if (event.key == "Enter") {handleGenerate()}
              }}
            />

            <div className="mx-auto">
              <button
                type="submit"
                onClick={handleGenerate}
                className="w-max rounded-full shadow-neu-sm p-1 bg-blue-200"
              >
                <div className="rounded-full shadow-lg text-lg px-4 py-1 font-bold text-white bg-gradient-to-b active:bg-gradient-to-t from-blue-400 to-blue-500 hover:brightness-105">
                  <span className="drop-shadow">送信</span>
                </div>
              </button>
            </div>
          </div>
        </div>

      </main>
    </>
  )
}
