import math

from src.domain.parsing.numeric import (
    parse_currency_prefixed_amount,
    parse_fr_number,
    parse_tax_rate,
)


def test_parse_fr_number_handles_thousands_and_decimal_comma():
    assert parse_fr_number("2 034,00") == 2034.0
    assert parse_fr_number("25,1210 €") == 25.121
    assert parse_fr_number("131,13") == 131.13
    assert parse_fr_number("-1,84") == -1.84


def test_parse_fr_number_returns_none_for_empty_or_nan():
    assert parse_fr_number("") is None
    assert parse_fr_number(None) is None
    assert parse_fr_number(float("nan")) is None
    assert parse_fr_number("nan") is None


def test_parse_currency_prefixed_amount():
    assert parse_currency_prefixed_amount("EUR 4000") == 4000.0
    assert parse_currency_prefixed_amount("EUR -19000") == -19000.0
    assert parse_currency_prefixed_amount("42.5") == 42.5
    assert parse_currency_prefixed_amount("") is None
    assert parse_currency_prefixed_amount("garbage") is None


def test_parse_tax_rate_accepts_percent_and_decimal_forms():
    assert parse_tax_rate("30%") == 0.3
    assert parse_tax_rate("0.3") == 0.3
    rate = parse_tax_rate("17,2%".replace(",", "."))
    assert rate is not None
    assert math.isclose(rate, 0.172)


def test_parse_tax_rate_falls_back_to_default():
    assert parse_tax_rate("", default=0.3) == 0.3
    assert parse_tax_rate(None, default=0.3) == 0.3
    assert parse_tax_rate("", default=None) is None
