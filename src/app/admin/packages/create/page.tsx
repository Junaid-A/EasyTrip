return (
  <div className="h-screen overflow-hidden bg-[#f7f3ee] text-[#171717]">
    <div className="mx-auto h-full max-w-[1600px] px-6 py-6">
      <div className="grid h-full grid-cols-[1fr_360px] gap-6">

        {/* LEFT SIDE */}
        <div className="overflow-y-auto space-y-6 pr-2">

          {/* HEADER */}
          <div className="rounded-[28px] border bg-white px-6 py-5">
            <h1 className="text-2xl font-semibold">Create Package</h1>
            <p className="text-sm text-gray-500 mt-1">
              Build structured travel packages using inventory
            </p>
          </div>

          {/* BASIC INFO */}
          <div className="rounded-[28px] border bg-white p-6 grid grid-cols-2 gap-4">

            <input
              placeholder="Package Name"
              className="rounded-xl border px-4 py-3 text-sm"
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <select
              className="rounded-xl border px-4 py-3 text-sm"
              onChange={(e) =>
                setForm({ ...form, country_id: e.target.value })
              }
            >
              <option>Select Country</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Days"
              className="rounded-xl border px-4 py-3 text-sm"
              onChange={(e) =>
                setForm({
                  ...form,
                  duration_days: Number(e.target.value),
                })
              }
            />

            <input
              type="number"
              placeholder="Nights"
              className="rounded-xl border px-4 py-3 text-sm"
              onChange={(e) =>
                setForm({
                  ...form,
                  duration_nights: Number(e.target.value),
                })
              }
            />
          </div>

          {/* DAYS */}
          <div className="space-y-5">
            {days.map((day, dIndex) => (
              <div
                key={dIndex}
                className="rounded-[28px] border bg-white p-6 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-lg">
                    Day {day.day_number}
                  </h2>
                </div>

                {/* CITY SELECT */}
                <select
                  className="rounded-xl border px-4 py-3 text-sm w-full"
                  onChange={(e) => {
                    const updated = [...days];
                    updated[dIndex].city_id = e.target.value;
                    setDays(updated);
                  }}
                >
                  <option>Select City</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* ACTIONS */}
                <div className="flex gap-2 flex-wrap">
                  {["hotel", "sightseeing", "transfer", "meal"].map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() => addItem(dIndex, type)}
                        className="px-3 py-1.5 rounded-full border text-xs hover:bg-gray-100"
                      >
                        + {type}
                      </button>
                    )
                  )}
                </div>

                {/* ITEMS */}
                <div className="space-y-2">
                  {day.items.map((item: any, i: number) => {
                    const options = getOptions(item.type);

                    // FILTER BY CITY 🔥
                    const filtered = options.filter(
                      (x: any) =>
                        !day.city_id || x.region_id === day.city_id
                    );

                    return (
                      <select
                        key={i}
                        className="rounded-xl border px-4 py-3 text-sm w-full"
                        onChange={(e) => {
                          const updated = [...days];
                          updated[dIndex].items[i].item_id =
                            e.target.value;
                          setDays(updated);
                        }}
                      >
                        <option>Select {item.type}</option>

                        {filtered.map((opt: any) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name}
                          </option>
                        ))}
                      </select>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* SAVE */}
          <div className="pb-10">
            <button
              onClick={handleSave}
              className="rounded-full bg-[#171717] text-white px-6 py-3 text-sm"
            >
              Save Package
            </button>
          </div>
        </div>

        {/* RIGHT SIDE - SUMMARY */}
        <div className="sticky top-0 h-full">

          <div className="rounded-[28px] border bg-white p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              Pricing Summary
            </h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Base</span>
                <span>₹{pricing.base}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Agent</span>
                <span>₹{pricing.agent}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Customer</span>
                <span>₹{pricing.customer}</span>
              </div>

              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Margin</span>
                <span>
                  ₹{pricing.customer - pricing.base}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);