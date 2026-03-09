type RequestCountProps = {
    name: string;
    ticketCount: number;
    assetCount: number;
};

export default function RequestCount({ name, ticketCount, assetCount }: RequestCountProps) {
    return (
        <div className="relative rounded-lg border border-gray-300 p-14 shadow-sm bg-white m-2">
            <div className="absolute top-4 left-4 font-semibold text-gray-800 text-xl">
                {name}
            </div>

            <div className="flex h-28 items-center justify-center">
                <div className="grid w-full max-w-xs grid-cols-2 gap-6 text-center">
                    <div>
                        <div className="text-5xl font-bold text-gray-900">{ticketCount}</div>
                        <div className="mt-1 text-sm font-semibold text-gray-500">Tickets</div>
                    </div>

                    <div>
                        <div className="text-5xl font-bold text-gray-900">{assetCount}</div>
                        <div className="mt-1 text-sm font-semibold text-gray-500">Assets</div>
                    </div>
                </div>
            </div>
        </div>
    );
}