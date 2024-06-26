import axios, { AxiosError } from "axios";
import Container from "./Container";
import { useState } from "react";
import { useMutation } from "react-query";
import { TbListTree } from "react-icons/tb";
import { twMerge } from "tailwind-merge";
import { CgSpinner } from "react-icons/cg";
import OutputLabels from "./OutputLabels";
import toast, { Toaster } from "react-hot-toast";

const examples = [
    { id: 'example1', text: 'Ang mga bakla parang tanga lang' },
    { id: 'example2', text: 'Tanginang mga katoliko kala mo diyos' },
    { id: 'example3', text: 'Hoy umayos ka kasuklam suklam itsura mo kadiri' },
]

const getWordCount = (text: string) => {
    return text.split(/\s+/).filter(word => word.length > 0).length;
}

const fetchLabels = async (inputText: string) => {
    console.log('fetching labels...');
    const { data } = await axios.post('http://localhost:8080/labels', { input: inputText });
    return data;
}

interface Label {
    name: string;
    probability: string;
}

interface Results {
    labels?: Label[];
    text?: string;
}

const InputHateSpeech = () => {

    const [results, setResults] = useState<Results>();
    const [error, setError] = useState('');
    const [inputText, setInputText] = useState('');
    const [isValidInput, setIsValidInput] = useState(false);
    const [prevInputText, setPrevInputText] = useState('');
    const [wordCount, setWordCount] = useState(0);

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {

        const value = event.target.value;
        setInputText(value);

        const wordCount = getWordCount(value);
        setWordCount(wordCount);
        setIsValidInput(wordCount >= 3 && wordCount <= 280);

    };

    const mutation = useMutation(fetchLabels, {
        onSuccess: (data) => {
            console.log('labels:', data);
            setResults(data);

            const prevInput = inputText;
            setPrevInputText(prevInput);
            toast.success('Hate speech classified successfully!');

        },
        onMutate: () => {
            setError('');
        },
        onError: (error: AxiosError) => {
            console.log('error:', error.message);
            setError(error.message)
            toast.error(error.message);
        }
    })


    const handleSubmitInput = () => {
        mutation.mutate(inputText)
    }

    const isButtonDisabled = (!isValidInput || mutation.isLoading) || (inputText === prevInputText);
    const isButtonActive = (isValidInput && !mutation.isLoading);
    const isButtonHoverable = (isValidInput && !mutation.isLoading);

    console.log('inputText:', inputText);
    console.log('prevInputText:', prevInputText);


    return (
        <section className="py-6 px-2 flex justify-center">
            <div>
                <div className="px-6 py-3 border-2 border-dashed">
                    <h1 className="mt-1 mb-3 text-center font-bold text-xl">Input Hate Speech Post</h1>
                    <div className="relative border">
                        <textarea value={inputText}
                            placeholder="Enter hate speech text here"
                            onChange={handleInputChange}
                            className={twMerge(`px-4 pt-2 pb-6 bg-[#EBEFF5] resize-none w-full  min-h-[200px] focus:outline-none`, `${isValidInput || wordCount === 0 ? 'outline-teal-500 focus:outline-teal-500' : 'outline-red-500 focus:outline-red-500'}`)}
                        />
                        <div className="px-4 py-3  justify-between items-center grid grid-cols-1 sm:flex gap-2">
                            <select className="text-sm px-6 py-4 rounded-md cursor-pointer order-3 sm:order-1"
                                onChange={handleInputChange}
                                value={inputText}
                            >
                                <option value="" defaultValue={""}>Select an example</option>
                                {examples.map((example, i) => (
                                    <option key={example.id} value={example.text}>{`Example ${i + 1}`}</option>
                                ))}
                            </select>
                            <h3 className={twMerge("text-sm pointer-events-none order-2 text-right", `${isValidInput || wordCount === 0 ? 'text-teal-500' : 'text-red-500'}`)}>

                                {
                                    wordCount === 0 ? (<span>Minimum <b>3</b> words</span>) : `${wordCount} / 280 words`
                                }

                            </h3>
                        </div>
                    </div>
                    <div className="">
                        <button disabled={isButtonDisabled}
                            className={`${isButtonActive ? 'opacity-100' : 'opacity-20'}  animate w-full my-3`}
                            onClick={handleSubmitInput}
                        >
                            <span
                                className={twMerge("font-mono text-sm px-6 py-4 bg-[#22242B] grid place-items-center text-white rounded-md items-center gap-2 transition-all duration-100 ease-in-out",
                                    `${isButtonHoverable ? 'hover:bg-teal-500' : ''}`)
                                }>

                                {

                                    !mutation.isLoading ? (
                                        <div className="flex gap-1 items-center">
                                            <TbListTree />
                                            Classify
                                        </div>) :
                                        (<div className="flex gap-1 items-center">
                                            <CgSpinner className="animate-spin" />
                                            Classifying...
                                        </div>)

                                }
                            </span>
                        </button>
                    </div>

                </div>
            </div>
            <div>

                {error &&
                    <Toaster position="bottom-right" />
                }
                <div className="max-w-lg">
                    <OutputLabels labels={results?.labels} text={results?.text} />
                    <Toaster position="bottom-right" toastOptions={{
                        className: 'bg-teal-500 text-white',
                        success: {
                            iconTheme: {
                                primary: '#FFFFFF',
                                secondary: '#2DD4BF',
                            },
                        }
                    }} />
                </div>
            </div>

        </section>

    );
}

export default InputHateSpeech

